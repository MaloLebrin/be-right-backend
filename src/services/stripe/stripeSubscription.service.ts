import { StripeService } from './stripe.service'

export class StripeSubscriptionService extends StripeService {
  constructor() {
    super()
  }

  async createSubscription({ customerId }: { customerId: string }) {
    if (!customerId) {
      throw new Error('Customer id is required')
    }

    return this.stripe.subscriptions.create({
      customer: customerId,
    })
  }
}
