import { describe, expect, test } from '@jest/globals'
import { composeSettingPayload } from '../../utils/settingsHelper'

describe('composeSettingPayload', () => {
  test('should return payoad without userId and user', () => {
    expect(composeSettingPayload({
      userId: 1,
      user: undefined,
      paginatedRequestLimit: {
        events: 10,
        notifications: 10,
        recipients: 10,
      },
    })).toStrictEqual({
      paginatedRequestLimit: {
        events: 10,
        notifications: 10,
        recipients: 10,
      },
    })
  })
})
