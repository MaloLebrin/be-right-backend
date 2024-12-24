import { SubscriptionEnum } from '../types/Subscription'

export function isPremiumSubscription(subscription) {
  return subscription.type === SubscriptionEnum.PREMIUM
}
