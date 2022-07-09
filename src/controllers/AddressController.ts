import { AddressService } from "../services"
import { Request, Response } from "express"
import { AddressEntity } from "../entity"

export class AddresController {

  public static getOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const address = await AddressService.getOne(id)
        return res.status(200).json(address)
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static getOneByEvent = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const address = await AddressService.getOneByEventId(id)
        return res.status(200).json(address)
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static getOneByUser = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const address = await AddressService.getOneByUserId(id)
        return res.status(200).json(address)
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static getOneByEmployee = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const address = await AddressService.getOneByEmployeeId(id)
        return res.status(200).json(address)
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static createOne = async (req: Request, res: Response) => {
    try {
      const { address, eventId, employeeId, userId }:
        { address: Partial<AddressEntity>, eventId?: number, employeeId: number, userId?: number } = req.body
      const newAddress = await AddressService.createOne({
        address,
        employeeId,
        eventId,
        userId,
      })
      if (newAddress) {
        return res.status(200).json(address)
      }
      return res.status(500).json('Address not created')
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static updateOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const { address }: { address: Partial<AddressEntity> } = req.body
        const addressUpdated = await AddressService.updateOne(id, address)
        if (addressUpdated) {
          return res.status(200).json(addressUpdated)
        }
        return res.status(500).json({ error: 'L\'address est requise' })
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        await AddressService.deleteOne(id)
        return res.status(203).json({ success: true, error: 'Adresse supprimée' })
      }
      return res.status(500).json({ error: 'L\'identifiant de l\'addresse est requis' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message, isSuccess: false })
      }
      return res.status(400).json({ error: error.message, isSuccess: false })
    }
  }
}
