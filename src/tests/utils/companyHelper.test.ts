import { expect, test } from '@jest/globals'
import companyJSON from '../fixtures/premium/company.json'
import {
  isBasicCie,
  isMediumCie,
  isPremiumCie,
} from '../../utils/companyHelper'
import type { CompanyEntity } from '../../entity/Company.entity'

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
})
