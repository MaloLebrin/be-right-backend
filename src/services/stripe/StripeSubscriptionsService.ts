import { StripeService } from './StripeService'

export class StripeSubscriptionService extends StripeService {
  constructor() {
    super()
  }

  public getAllStripeSubscriptions = async () => {
    return this.stripe.subscriptions.list()
  }

  // WIP
  public createStripeSubscription = async ({
    stripeCustomerId,
  }: {
    stripeCustomerId: string
  }) => {
    return this.stripe.subscriptions.create({
      // customer: stripeCustomerId,
      // currency: StripeCurrency.EUR,
    })
  }
}
