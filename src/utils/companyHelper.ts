import type { CompanyEntity } from '../entity/Company.entity'
import { SubscriptionEnum } from '../types'

export function isPremiumCie(company: CompanyEntity) {
  return company.subscriptionLabel === SubscriptionEnum.PREMIUM
}

export function isMediumCie(company: CompanyEntity) {
  return company.subscriptionLabel === SubscriptionEnum.MEDIUM
}

export function isBasicCie(company: CompanyEntity) {
  return company.subscriptionLabel === SubscriptionEnum.BASIC
}
