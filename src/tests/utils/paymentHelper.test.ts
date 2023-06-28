import { expect, test } from 'vitest'
import { fromCent, toCent } from '../../utils/paymentHelper'

test('toCent should convert amount in cents', () => {
  expect(toCent(1)).toEqual(100)
  expect(toCent(10.50)).toEqual(1050)
  expect(toCent(-10.50)).toEqual(-1050)
  expect(() => toCent(null as unknown as number)).toThrowError(/amount cannot be Calculate toCent/)
  expect(() => toCent(undefined as unknown as number)).toThrowError(/amount cannot be Calculate toCent/)
  expect(toCent('1' as unknown as number)).toEqual(100)
})

test('from should convert amount in €', () => {
  expect(fromCent(100)).toEqual(1)
  expect(fromCent(1050)).toEqual(10.50)
  expect(fromCent(-1050)).toEqual(-10.50)
  expect(() => fromCent(null as unknown as number)).toThrowError(/amount cannot be Calculate fromCent/)
  expect(() => fromCent(undefined as unknown as number)).toThrowError(/amount cannot be Calculate fromCent/)
  expect(fromCent('100' as unknown as number)).toEqual(1)
})
