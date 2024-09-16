import type { DataSource } from 'typeorm/data-source'
import { StripeService } from '../../services/stripe/stripe.service'

export class StripeWebhookService extends StripeService {
  constructor(APP_SOURCE: DataSource) {
    super()
  }

  async PaymentIntentSucceeded() {}

  async PaymentMethodAttached() {}
}
