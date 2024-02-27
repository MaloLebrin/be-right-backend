import { expect, test } from '@jest/globals'
import companyJSON from '../fixtures/premium/company.json'
import {
  isBasicCie,
  isMediumCie,
  isPremiumCie,
} from '../../utils/companyHelper'
import type { CompanyEntity } from '../../entity/Company.entity'
import { SubscriptionEnum } from '../../types/Subscription'

const company = companyJSON as unknown as CompanyEntity

test('isBasicCie, isMediumCie, isPremiumCie, send right bool', () => {
  expect(isPremiumCie(company)).toBeTruthy()
  expect(isMediumCie(company)).toBeFalsy()
  expect(isBasicCie(company)).toBeFalsy()
  expect(isPremiumCie(null as unknown as CompanyEntity)).toBeFalsy()
  expect(isMediumCie(null as unknown as CompanyEntity)).toBeFalsy()
  expect(isBasicCie(null as unknown as CompanyEntity)).toBeFalsy()
  expect(isPremiumCie(undefined as unknown as CompanyEntity)).toBeFalsy()
  expect(isMediumCie(undefined as unknown as CompanyEntity)).toBeFalsy()
  expect(isBasicCie(undefined as unknown as CompanyEntity)).toBeFalsy()

  expect(isPremiumCie({ subscriptionLabel: SubscriptionEnum.BASIC } as CompanyEntity)).toBeFalsy()
  expect(isMediumCie({ subscriptionLabel: SubscriptionEnum.BASIC } as CompanyEntity)).toBeFalsy()
  expect(isBasicCie({ subscriptionLabel: SubscriptionEnum.BASIC } as CompanyEntity)).toBeTruthy()

  expect(isPremiumCie({ subscriptionLabel: SubscriptionEnum.MEDIUM } as CompanyEntity)).toBeFalsy()
  expect(isMediumCie({ subscriptionLabel: SubscriptionEnum.MEDIUM } as CompanyEntity)).toBeTruthy()
  expect(isBasicCie({ subscriptionLabel: SubscriptionEnum.MEDIUM } as CompanyEntity)).toBeFalsy()

  expect(isPremiumCie({ subscriptionLabel: SubscriptionEnum.PREMIUM } as CompanyEntity)).toBeTruthy()
  expect(isMediumCie({ subscriptionLabel: SubscriptionEnum.PREMIUM } as CompanyEntity)).toBeFalsy()
  expect(isBasicCie({ subscriptionLabel: SubscriptionEnum.PREMIUM } as CompanyEntity)).toBeFalsy()
})
