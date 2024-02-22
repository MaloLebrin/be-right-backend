import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { ApiError } from '../../middlewares/ApiError'
import { wrapperRequest } from '../../utils'

export class StripeCustomerController {
  private StripeCustomerService: StripeCustomerService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
    }
  }

  public getCustomerByUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user
      const stripeCustomer = await this.StripeCustomerService.getStripeCustomerForUser(user)

      if (!stripeCustomer) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      return res.status(200).json(stripeCustomer)
    })
  }
}
