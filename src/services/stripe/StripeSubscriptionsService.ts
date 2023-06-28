import type { DataSource } from 'typeorm'
import dayjs from 'dayjs'
import type { CancelReasonEnum, StripeProductForSession } from '../../types/Stripe/Index'
import { StripeCurrency } from '../../types/Stripe/Payment'
import { SubscriptionService } from '../SubscriptionService'
import type { SubscriptionEnum } from '../../types'
import { StripeService } from './StripeService'

export class StripeSubscriptionService extends StripeService {
  private SubscriptionService: SubscriptionService

  constructor(APP_SOURCE: DataSource) {
    super()
    this.SubscriptionService = new SubscriptionService(APP_SOURCE)
  }

  public getAllStripeSubscriptions = async () => {
    return this.stripe.subscriptions.list()
  }

  public createStripeSubscription = async ({
    subscriptionId,
    stripeCustomerId,
    products,
  }: {
    subscriptionId: number
    stripeCustomerId: string
    products: StripeProductForSession[]
  }) => {
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      currency: StripeCurrency.EUR,
      items: products,
    })

    await this.SubscriptionService.updateOne(subscriptionId, {
      expireAt: dayjs(stripeSubscription.canceled_at).toDate(),
      type: stripeSubscription.metadata.apiType as SubscriptionEnum,
    })

    return stripeSubscription
  }

  public cancelStripeSubscription = async ({
    subscriptionId,
    stripeSubscriptionId,
    reason,
    comment,
  }: {
    subscriptionId: number
    stripeSubscriptionId: string
    reason?: CancelReasonEnum
    comment?: string
  }) => {
    await this.SubscriptionService.updateOne(subscriptionId, {
      expireAt: dayjs().toDate(),
    })

    return this.stripe.subscriptions.cancel(stripeSubscriptionId, {
      cancellation_details: {
        feedback: reason,
        comment,
      },
    })
  }
}
