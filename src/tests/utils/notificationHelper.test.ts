import { expect, test } from '@jest/globals'
import {
  getNotificationTypeByEventStatus,
} from '../../utils/notificationHelper'
import eventJSON from '../fixtures/premium/events.json'
import type EventEntity from '../../entity/EventEntity'
import { NotificationTypeEnum } from '../../types/Notification'

const events = eventJSON as unknown as EventEntity[]

test('getNotificationTypeByEventStatus send right type', () => {
  expect(getNotificationTypeByEventStatus(events[0])).toEqual(NotificationTypeEnum.EVENT_PENDING)
  expect(getNotificationTypeByEventStatus(events[1])).toEqual(NotificationTypeEnum.EVENT_CREATED)
  expect(getNotificationTypeByEventStatus(events[2])).toEqual(NotificationTypeEnum.EVENT_PENDING)
  expect(getNotificationTypeByEventStatus(events[3])).toEqual(NotificationTypeEnum.EVENT_CLOSED)
  expect(getNotificationTypeByEventStatus(events[4])).toEqual(NotificationTypeEnum.EVENT_PENDING)
  expect(getNotificationTypeByEventStatus(events[5])).toEqual(NotificationTypeEnum.EVENT_CREATED)
  expect(getNotificationTypeByEventStatus(events[6])).toEqual(NotificationTypeEnum.EVENT_COMPLETED)
  expect(getNotificationTypeByEventStatus(events[7])).toEqual(NotificationTypeEnum.EVENT_CLOSED)
})
