import { SubscriptionEntitiy } from "../entity"
import dayjs from "dayjs"
import { SubscriptionEnum } from "../types/Subscription"

export function isSubscriptionActive(subscription: SubscriptionEntitiy): boolean {
  return dayjs(subscription.expireAt).isBefore(dayjs())
}

export function isPremium(subscription: SubscriptionEntitiy): boolean {
  return subscription.type === SubscriptionEnum.PREMIUM
}
