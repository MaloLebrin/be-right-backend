import type { Request, Response } from 'express'
import { AddressService } from '../services'
import { wrapperRequest } from '../utils'
import { APP_SOURCE, REDIS_CACHE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import { ApiError } from '../middlewares/ApiError'

export class AddresController {
  AddressService: AddressService
  redisCache: RedisCache

  constructor() {
    this.AddressService = new AddressService(APP_SOURCE)
    this.redisCache = REDIS_CACHE
  }

  private saveAddressInCache = async (address: AddressEntity) => {
    await this.redisCache.save(`address-id-${address.id}`, address)
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
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

      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis').Handler(res)
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      const addressIds = ids.split(',').map(id => parseInt(id))

      if (addressIds && addressIds.length > 0) {
        const addresses = await this.redisCache.getMany<AddressEntity>({
          keys: generateRedisKeysArray({
            field: 'id',
            typeofEntity: EntitiesEnum.ADDRESS,
            ids: addressIds,
          }),
          typeofEntity: EntitiesEnum.ADDRESS,
          fetcher: () => this.AddressService.getMany(addressIds),
        })

        return res.status(200).json(addresses)
      }

      throw new ApiError(422, 'Identifiants des addresses sont requis').Handler(res)
    })
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const {
        address,
        eventId,
        employeeId,
        userId,
      }:
      {
        address: Partial<AddressEntity>
        eventId?: number
        employeeId?: number
        userId?: number
      } = req.body

      const newAddress = await this.AddressService.createOne({
        address,
        employeeId,
        eventId,
        userId,
      })

      if (newAddress) {
        await this.saveAddressInCache(newAddress)
        return res.status(200).json(newAddress)
      }
      throw new ApiError(422, 'Addresse non crée').Handler(res)
    })
  }

  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const { address }: { address: Partial<AddressEntity> } = req.body

        const addressUpdated = await this.AddressService.updateOne(id, address)

        if (addressUpdated) {
          await this.saveAddressInCache(addressUpdated)

          return res.status(200).json(addressUpdated)
        }

        throw new ApiError(422, 'Addresse manquante').Handler(res)
      }
      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis').Handler(res)
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
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

      throw new ApiError(422, 'L\'identifiant de l\'addresse est requis').Handler(res)
    })
  }
}
