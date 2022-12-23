import type { Request, Response } from 'express'
import { AddressService } from '../services'
import { wrapperRequest } from '../utils'
import { APP_SOURCE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'

export class AddresController {
  AddressService: AddressService

  constructor() {
    this.AddressService = new AddressService(APP_SOURCE)
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const address = await this.AddressService.getOne(id)
        return res.status(200).json(address)
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    })
  }

  // public getOneByEvent = async (req: Request, res: Response) => {
  //   await wrapperRequest(req, res, async () => {
  //     const id = parseInt(req.params.id)
  //     if (id) {
  //       const address = await this.AddressService.getOneByEventId(id)
  //       return res.status(200).json(address)
  //     }
  //     return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
  //   })
  // }

  // public getOneByUser = async (req: Request, res: Response) => {
  //   await wrapperRequest(req, res, async () => {
  //     const id = parseInt(req.params.id)
  //     if (id) {
  //       const address = await this.AddressService.getOneByUserId(id)
  //       return res.status(200).json(address)
  //     }
  //     return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
  //   })
  // }

  // public getOneByEmployee = async (req: Request, res: Response) => {
  //   await wrapperRequest(req, res, async () => {
  //     const id = parseInt(req.params.id)
  //     if (id) {
  //       const address = await this.AddressService.getOneByEmployeeId(id)
  //       return res.status(200).json(address)
  //     }
  //     return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
  //   })
  // }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { address, eventId, employeeId, userId }:
        { address: Partial<AddressEntity>; eventId?: number; employeeId?: number; userId?: number } = req.body
      const newAddress = await this.AddressService.createOne({
        address,
        employeeId,
        eventId,
        userId,
      })
      if (newAddress) {
        return res.status(200).json(newAddress)
      }
      return res.status(500).json('Address not created')
    })
  }

  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const { address }: { address: Partial<AddressEntity> } = req.body
        const addressUpdated = await this.AddressService.updateOne(id, address)
        if (addressUpdated) {
          return res.status(200).json(addressUpdated)
        }
        return res.status(500).json({ error: 'L\'address est requise' })
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        await this.AddressService.deleteOne(id)
        return res.status(203).json({ success: true, error: 'Adresse supprimée' })
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    })
  }
}
