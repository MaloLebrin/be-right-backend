import type { DataSource } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { StripeCustomerService } from '../../services/stripe/stripeCustomer.service'
import { StripeCheckoutSessionService } from '../../services/stripe/stripeCheckout.service'
import { DraftEventService } from '../../services/DraftEventService.service'
import { EventCreateService } from '../../services/event/eventCreateService.service'
import { wrapperRequest } from '../../utils'
import { StripeWebhookService } from '../../services/stripe/stripeWebhook.service'

export class StripeWebhookController {
  private StripeCustomerService: StripeCustomerService
  private StripeCheckoutSessionService: StripeCheckoutSessionService
  private DraftEventService: DraftEventService
  private EventCreateService: EventCreateService
  private StripeWebhookService: StripeWebhookService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeCustomerService = new StripeCustomerService(DATA_SOURCE)
      this.StripeCheckoutSessionService = new StripeCheckoutSessionService()
      this.DraftEventService = new DraftEventService(DATA_SOURCE)
      this.EventCreateService = new EventCreateService(DATA_SOURCE)
      this.StripeWebhookService = new StripeWebhookService(DATA_SOURCE)
    }
  }

  async events(req: Request, res: Response, next: NextFunction) {
    await wrapperRequest(req, res, next, async () => {
      const sig = req.headers['stripe-signature']
      const params = req.params

      const event = req.body
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
          return this.StripeWebhookService.PaymentIntentSucceeded()

        case 'payment_method.attached':
          const paymentMethod = event.data.object
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          return this.StripeWebhookService.PaymentMethodAttached()

        default:
          console.log(`Unhandled event type ${event.type}`)
      }
      console.log({ event, params, sig }, '<==== {body, params}')
      return res.status(200).json({ message: 'ok' })
    })
  }
}
