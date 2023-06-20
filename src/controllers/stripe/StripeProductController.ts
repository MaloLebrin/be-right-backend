import type { NextFunction, Request, Response } from 'express'
import { StripeService } from '../../services/StripeService'
import { wrapperRequest } from '../../utils'

export class StripeProductController extends StripeService {
  constructor() { super() }

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const products = await this.stripe.products.list({ expand: ['data.default_price'] })
      return res.status(200).json(products.data)
    })
  }
}
