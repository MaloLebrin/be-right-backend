import { describe, expect, test } from '@jest/globals'
import dayjs from 'dayjs'
import eventJSON from '../fixtures/premium/events.json'
import {
  hasNotEventStartedYet,
  isEventInProgress,
  isEventOver,
  orderingEventsByStatusAndDate,
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
  expect(updateStatusEventBasedOnStartEndTodayDate(events[0])).toStrictEqual(EventStatusEnum.CLOSED)
  expect(updateStatusEventBasedOnStartEndTodayDate(events[1])).toStrictEqual(EventStatusEnum.CREATE)
  expect(updateStatusEventBasedOnStartEndTodayDate(events[2])).toStrictEqual(EventStatusEnum.PENDING)
})

test('updateStatusEventBasedOnStartEndTodayDate send right bool', () => {
  const event = removeUnecessaryFieldsEvent(events[0])
  expect(event.partnerId).toBeFalsy()
  expect(event.addressId).toBeFalsy()
})

describe('orderingEventsByStatusAndDate', () => {
  test('should return an empty array if no events', () => {
    expect(orderingEventsByStatusAndDate([])).toStrictEqual([])
  })

  test('should return an array of events ordered by status and date', () => {
    const orderedEvents = orderingEventsByStatusAndDate([
      {
        id: 1,
        status: EventStatusEnum.CLOSED,
        start: '2021-10-10T10:00:00.000Z',
        end: '2021-10-10T11:00:00.000Z',
      },
      {
        id: 2,
        status: EventStatusEnum.PENDING,
        start: '2021-10-10T10:00:00.000Z',
        end: dayjs().add(1, 'month').toISOString(),
      },
      {
        id: 3,
        status: EventStatusEnum.CREATE,
        start: '2021-10-10T10:00:00.000Z',
        end: dayjs().add(1, 'month').toISOString(),
      },
      {
        id: 4,
        status: EventStatusEnum.COMPLETED,
        start: '2021-10-10T10:00:00.000Z',
        end: '2022-10-10T11:00:00.000Z',
      },
    ] as unknown as EventEntity[])
    expect(orderedEvents).toStrictEqual([
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 }),
      expect.objectContaining({ id: 4 }),
      expect.objectContaining({ id: 1 }),
    ])
  })

  test('should sort event by date start and end when status is the same', () => {
    const orderedEvents = orderingEventsByStatusAndDate([
      {
        id: 1,
        status: EventStatusEnum.CLOSED,
        start: '2021-10-10T10:00:00.000Z',
        end: '2021-10-10T11:00:00.000Z',
      },
      {
        id: 2,
        status: EventStatusEnum.PENDING,
        start: '2021-10-10T10:00:00.000Z',
        end: dayjs().add(1, 'month').toISOString(),
      },
      {
        id: 5,
        status: EventStatusEnum.PENDING,
        start: '2021-10-10T10:00:00.000Z',
        end: dayjs().add(1, 'day').toISOString(),
      },
      {
        id: 3,
        status: EventStatusEnum.CREATE,
        start: '2021-10-10T10:00:00.000Z',
        end: dayjs().add(1, 'month').toISOString(),
      },
      {
        id: 4,
        status: EventStatusEnum.COMPLETED,
        start: '2021-10-10T10:00:00.000Z',
        end: '2022-10-10T11:00:00.000Z',
      },
    ] as unknown as EventEntity[])
    expect(orderedEvents).toStrictEqual([
      expect.objectContaining({ id: 5 }),
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 }),
      expect.objectContaining({ id: 4 }),
      expect.objectContaining({ id: 1 }),
    ])
  })
})
