import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { StripeCheckoutSessionService } from '../../services/stripe/stripeCheckout.service'
import { ModePaymentEnum, type StripeCheckoutSessionCreationPayload } from '../../types/Stripe'
import { DraftEventService } from '../../services/DraftEventService.service'

export class StripeController {
  private StripeCustomerService: StripeCustomerService
  private StripeCheckoutSessionService: StripeCheckoutSessionService
  private DraftEventService: DraftEventService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
      this.StripeCheckoutSessionService = new StripeCheckoutSessionService()
      this.DraftEventService = new DraftEventService(DATA_SOURCE)
    }
  }

  public payEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user
      const stripeCustomer = await this.StripeCustomerService.getStripeCustomerForUser(user)

      if (!stripeCustomer || !user.email || !user.companyId) {
        throw new ApiError(500, 'Une erreur s\'est produite impossible d\'identifier l\'utilisateur')
      }

      const {
        priceId,
        event,
        address,
        photographerId,
      }: StripeCheckoutSessionCreationPayload = req.body

      const session = await this.StripeCheckoutSessionService.createStripeCheckoutSession({
        stripeCustomerId: stripeCustomer.id,
        modePayment: ModePaymentEnum.PAYMENT,
        products: [
          {
            price: priceId,
            quantity: event.employeeIds?.length,
          },
        ],
      })

      if (!session) {
        throw new ApiError(500, 'Une erreur s\'est produite lors de la création de la session de paiement')
      }

      const draftEvent = await this.DraftEventService.createDraftEvent({
        checkoutSessionId: session.id,
        companyId: user.companyId,
        data: {
          event,
          address,
          photographerId,
        },
      })

      if (!draftEvent) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      return res.status(200).json({ sessionUrl: session.url })
    })
  }
}
