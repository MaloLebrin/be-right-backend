import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { wrapperRequest } from '../../utils'
import { StripeWebhookService } from '../../services/stripe/stripeWebhook.service'
import type { WebhookEvent } from '../../types/Stripe'
import { logger } from '../../middlewares/loggerService'

export class StripeWebhookController {
  private StripeWebhookService: StripeWebhookService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeWebhookService = new StripeWebhookService(DATA_SOURCE)
    }
  }

  async events(req: Request, res: Response, next: NextFunction) {
    await wrapperRequest(req, res, next, async () => {
      const sig = req.headers['stripe-signature']
      const params = req.params

      const event: WebhookEvent<unknown> = req.body
      switch (event.type) {
        case 'checkout.session.async_payment_failed':
          return

        case 'checkout.session.completed':
          return

        case 'checkout.session.async_payment_succeeded':
          return

        case 'checkout.session.expired':
          return

        default:
          logger.info(`Unhandled event type ${event.type}`)
          break
      }
      console.log({ event, params, sig }, '<==== {body, params}')
      return res.status(200).json({ message: 'ok' })
    })
  }
}
