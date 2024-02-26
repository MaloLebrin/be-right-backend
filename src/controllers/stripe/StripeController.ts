import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { StripeCheckoutSessionService } from '../../services/stripe/stripeCheckout.service'
import { ModePaymentEnum } from '../../types/Stripe'

export class StripeController {
  private StripeCustomerService: StripeCustomerService
  private StripeCheckoutSessionService: StripeCheckoutSessionService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
      this.StripeCheckoutSessionService = new StripeCheckoutSessionService()
    }
  }

  public payEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user
      const stripeCustomer = await this.StripeCustomerService.getStripeCustomerForUser(user)

      if (!stripeCustomer) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const { nbRecipients, priceId }: { nbRecipients: number; priceId: string } = req.body

      await this.StripeCheckoutSessionService.createStripeCheckoutSession({
        stripeCustomerId: stripeCustomer.id,
        customerEmail: user.email,
        modePayment: ModePaymentEnum.PAYMENT,
        products: [
          {
            price: priceId,
            quantity: nbRecipients,
          },
        ],
      })
    })
  }
}
