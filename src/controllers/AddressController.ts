import type { NextFunction, Request, Response } from 'express'
import type { DataSource } from 'typeorm'
import { AddressService } from '../services'
import { wrapperRequest } from '../utils'
import { REDIS_CACHE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { generateRedisKey } from '../utils/redisHelper'
import { ApiError } from '../middlewares/ApiError'

export class AddresController {
  AddressService: AddressService
  redisCache: RedisCache

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.AddressService = new AddressService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
    }
  }

  private saveAddressInCache = async (address: AddressEntity) => {
    await this.redisCache.save(`address-id-${address.id}`, address)
  }

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const address = await this.redisCache.get<AddressEntity>(
          generateRedisKey({
            field: 'id',
            typeofEntity: EntitiesEnum.ADDRESS,
            id,
          }),
          () => this.AddressService.getOne(id))

        return res.status(200).json(address)
      }

      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis')
    })
  }

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const ids = req.query.ids as string
      const addressIds = ids.split(',').map(id => parseInt(id))

      if (addressIds && addressIds.length > 0) {
        const addresses = await this.AddressService.getMany(addressIds)

        return res.status(200).json(addresses)
      }

      throw new ApiError(422, 'Identifiants des addresses sont requis')
    })
  }

  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const {
        address,
        eventId,
        employeeId,
        companyId,
      }:
      {
        address: Partial<AddressEntity>
        eventId?: number
        employeeId?: number
        companyId?: number
      } = req.body

      const newAddress = await this.AddressService.createOne({
        address,
        employeeId,
        eventId,
        companyId,
      })

      if (newAddress) {
        await this.saveAddressInCache(newAddress)
        return res.status(200).json(newAddress)
      }
      throw new ApiError(422, 'Addresse non crée')
    })
  }

  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const { address }: { address: Partial<AddressEntity> } = req.body

        const addressUpdated = await this.AddressService.updateOne(id, address)

        if (addressUpdated) {
          await this.saveAddressInCache(addressUpdated)

          return res.status(200).json(addressUpdated)
        }

        throw new ApiError(422, 'Addresse manquante')
      }
      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis')
    })
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        await this.redisCache.invalidate(generateRedisKey({
          typeofEntity: EntitiesEnum.ADDRESS,
          field: 'id',
          id,
        }))

        await this.AddressService.deleteOne(id)
        return res.status(203).json({ success: true, error: 'Adresse supprimée' })
      }

      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis')
    })
  }
}
