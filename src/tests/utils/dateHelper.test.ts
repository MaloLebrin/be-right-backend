import { describe, expect, test } from '@jest/globals'
import {
  isEventPeriodInDay,
} from '../../utils/eventHelpers'
import type { Period } from '../../types'

describe('isEventPeriodInDay send right bool', () => {
  const now = new Date()
  test('no params', () => {
    expect(isEventPeriodInDay({
      start: null,
      end: null,
    } as unknown as Period, now)).toBeFalsy()
    expect(isEventPeriodInDay({
      start: null,
      end: null,
    } as unknown as Period, now)).toStrictEqual(false)
  })
})
