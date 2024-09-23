import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { wrapperRequest } from '../../utils'
import { StripeWebhookService } from '../../services/stripe/stripeWebhook.service'
import type { StripeWebhookEventObject, WebhookEvent } from '../../types/Stripe'
import { logger } from '../../middlewares/loggerService'

export class StripeWebhookController {
  private StripeWebhookService: StripeWebhookService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeWebhookService = new StripeWebhookService()
    }
  }

  async events(req: Request, res: Response, next: NextFunction) {
    await wrapperRequest(req, res, next, async () => {
      // const sig = req.headers['stripe-signature']
      // const params = req.params

      const event: WebhookEvent<StripeWebhookEventObject> = req.body
      switch (event.type) {
        case 'checkout.session.async_payment_failed':
          logger.info(`Payment failed for session ${event.data.object.id}`)
          return

        case 'checkout.session.completed':
          logger.info(`Payment completed for session ${event.data.object.id}`)
          return

        case 'checkout.session.async_payment_succeeded':
          logger.info(`Payment succeeded for session ${event.data.object.id}`)
          return

        case 'checkout.session.expired':
          logger.info(`Session expired for session ${event.data.object.id}`)
          return

        default:
          logger.info(`Unhandled event type ${event.type}`)
          break
      }

      return res.status(200).json({ message: 'ok' })
    })
  }
}
