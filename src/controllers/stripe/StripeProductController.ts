import type { NextFunction, Request, Response } from 'express'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { StripeProductService } from '../../services/stripe/StripeProductService'

export class StripeProductController {
  private StripeProductService: StripeProductService
  constructor() {
    this.StripeProductService = new StripeProductService()
  }

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const products = await this.StripeProductService.getProducts()
      return res.status(200).json(products.data)
    })
  }

  public getAmountForProduct = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { productId, quantity }: { productId: string; quantity?: number } = req.body

      if (!productId) {
        throw new ApiError(422, 'Identifiant ou quantité du produit manquant(e)')
      }

      const response = await this.StripeProductService.getAmountForProduct({
        productId,
        quantity,
      })

      return res.status(200).json(response)
    })
  }
}
