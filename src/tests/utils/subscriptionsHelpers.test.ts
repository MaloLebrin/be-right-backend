import { describe, expect, test } from '@jest/globals'
import dayjs from 'dayjs'
import { isPremiumSubscription, isSubscriptionExpired } from '../../utils/subscriptionHelper'
import { SubscriptionEnum } from '../../types/Subscription'
import type { SubscriptionEntity } from '../../entity/SubscriptionEntity'

describe('isPremiumSubscription', () => {
  test('should return true if subscription is premium', () => {
    expect(isPremiumSubscription({
      type: SubscriptionEnum.PREMIUM,
    } as SubscriptionEntity)).toBeTruthy()
  })

  test('should return false if subscription is not premium', () => {
    expect(isPremiumSubscription({
      type: 'BASIC',
      expireAt: new Date(),
    } as SubscriptionEntity)).toBeFalsy()

    expect(isPremiumSubscription({
      type: 'MEDIUM',
    } as SubscriptionEntity)).toBeFalsy()
  })
})

describe('isSubscriptionExpired', () => {
  test('should return true if subscription is expired', () => {
    expect(isSubscriptionExpired({
      expireAt: new Date('2021-01-01'),
    } as SubscriptionEntity)).toBeTruthy()

    expect(isSubscriptionExpired({
      expireAt: dayjs().subtract(1, 'day').toDate(),
    } as SubscriptionEntity)).toBeTruthy()
  })

  test('should return false if subscription is not expired', () => {
    expect(isSubscriptionExpired({
      expireAt: dayjs().add(1, 'year').toDate(),
    } as SubscriptionEntity)).toBeFalsy()

    expect(isSubscriptionExpired({
      expireAt: dayjs().add(1, 'day').toDate(),
    } as SubscriptionEntity)).toBeFalsy()
  })
})
