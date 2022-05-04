import { SubscriptionEnum } from "../types/Subscription"
import { UserEntity } from "../entity"
import { hasOwnProperty } from "./objectHelper"

export function getfullUsername(user: UserEntity): string {
  return `${user.firstName} ${user.lastName}`
}

export function isUserEntity(user: any): user is UserEntity {
  return hasOwnProperty(user, 'token') && hasOwnProperty(user, 'salt')
}

export function isSubscriptionOptionField(field: string): boolean {
  return Object.values(SubscriptionEnum).includes(field as SubscriptionEnum)
}
