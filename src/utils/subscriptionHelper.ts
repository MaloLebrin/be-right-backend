import dayjs from 'dayjs'
import { SubscriptionEnum } from '../types/Subscription'
import type { SubscriptionEntity } from '../entity/SubscriptionEntity'

export function isPremiumSubscriptionType(type: SubscriptionEnum) {
  return type === SubscriptionEnum.PREMIUM
}

export function isPremiumSubscription(subscription: SubscriptionEntity) {
  if (!subscription) {
    return false
  }
  return isPremiumSubscriptionType(subscription.type)
}

export function isSubscriptionExpired(subscription: SubscriptionEntity) {
  if (!subscription) {
    return true
  }
  return dayjs().isAfter(subscription?.expireAt)
}
