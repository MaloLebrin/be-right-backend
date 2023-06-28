import type { CancelReasonEnum, StripeProductForSession } from '../../types/Stripe/Index'
import { StripeCurrency } from '../../types/Stripe/Payment'
import { StripeService } from './StripeService'

export class StripeSubscriptionService extends StripeService {
  constructor() {
    super()
  }

  public getAllStripeSubscriptions = async () => {
    return this.stripe.subscriptions.list()
  }

  public createStripeSubscription = async ({
    stripeCustomerId,
    products,
  }: {
    stripeCustomerId: string
    products: StripeProductForSession[]
  }) => {
    return this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      currency: StripeCurrency.EUR,
      items: products,
    })
  }

  public cancelStripeSubscription = async ({
    stripeSubscriptionId,
    reason,
    comment,
  }: {
    stripeSubscriptionId: string
    reason?: CancelReasonEnum
    comment?: string
  }) => {
    return this.stripe.subscriptions.cancel(stripeSubscriptionId, {
      cancellation_details: {
        feedback: reason,
        comment,
      },
    })
  }
}
