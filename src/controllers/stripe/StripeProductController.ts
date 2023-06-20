import type { NextFunction, Request, Response } from 'express'
import type Stripe from 'stripe'
import { StripeService } from '../../services/StripeService'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { fromCent } from '../../utils/paymentHelper'

export class StripeProductController extends StripeService {
  constructor() { super() }

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const products = await this.stripe.products.list({ expand: ['data.default_price'] })
      return res.status(200).json(products.data)
    })
  }

  public getAmountForProduct = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { productId, quantity }: { productId: string; quantity: number } = req.body

      if (!productId) {
        throw new ApiError(422, 'Identifiant du produit manquand')
      }

      const product = await this.stripe.products.retrieve(productId, { expand: ['default_price'] })
      const price = product.default_price as Stripe.Price

      return res.status(200).json({
        id: productId,
        unitAmout: fromCent(price.unit_amount),
        totalAmount: fromCent(price.unit_amount * quantity),
        quantity,
      })
    })
  }
}
