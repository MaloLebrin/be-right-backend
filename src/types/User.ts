import type { Role } from './Role'
import type { SubscriptionEnum } from './Subscription'

export enum ThemeEnum {
  LIGHT = 'light',
  DARK = 'dark',
}

export const ThemeEnumArray = Object.values(ThemeEnum)

export interface JWTTokenPayload {
  email: string
  firstName: string
  lastName: string
  roles: Role
  subscription?: SubscriptionEnum
}

export interface CreateUserPayload {
  companyId: number
  email: string
  firstName: string
  lastName: string
  password: string
  role: Role
  subscription: SubscriptionEnum
  subscriptionId?: number
  loggedAt?: null | Date
  badges?: number[]
}
