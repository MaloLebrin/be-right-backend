import { expect, test } from '@jest/globals'
import eventJSON from '../fixtures/premium/events.json'
import {
  hasNotEventStartedYet,
  isEventInProgress,
  isEventOver,
  removeUnecessaryFieldsEvent,
  updateStatusEventBasedOnStartEndTodayDate,
} from '../../utils/eventHelpers'
import type EventEntity from '../../entity/EventEntity'
import { EventStatusEnum } from '../../types/Event'

const events = eventJSON as unknown as EventEntity[]

test('isEventOver send right bool', () => {
  expect(isEventOver(events[0])).toBeTruthy()
  expect(isEventOver(events[1])).toBeFalsy()
  expect(isEventOver(events[2])).toBeFalsy()
})

test('isEventInProgress send right bool', () => {
  expect(isEventInProgress(events[0])).toBeFalsy()
  expect(isEventInProgress(events[1])).toBeFalsy()
  expect(isEventInProgress(events[2])).toBeTruthy()
})

test('hasNotEventStartedYet send right bool', () => {
  expect(hasNotEventStartedYet(events[0])).toBeFalsy()
  expect(hasNotEventStartedYet(events[1])).toBeTruthy()
  expect(hasNotEventStartedYet(events[2])).toBeFalsy()
})

test('updateStatusEventBasedOnStartEndTodayDate send right bool', () => {
  expect(updateStatusEventBasedOnStartEndTodayDate(events[0])).toEqual(EventStatusEnum.CLOSED)
  expect(updateStatusEventBasedOnStartEndTodayDate(events[1])).toEqual(EventStatusEnum.CREATE)
  expect(updateStatusEventBasedOnStartEndTodayDate(events[2])).toEqual(EventStatusEnum.PENDING)
})

test('updateStatusEventBasedOnStartEndTodayDate send right bool', () => {
  const event = removeUnecessaryFieldsEvent(events[0])
  expect(event.partnerId).toBeFalsy()
  expect(event.addressId).toBeFalsy()
})
