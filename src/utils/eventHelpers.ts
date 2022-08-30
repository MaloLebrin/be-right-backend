import dayjs from 'dayjs'
import type EventEntity from '../entity/EventEntity'
import { EventStatusEnum } from '../types/Event'

export function isEventOver(event: EventEntity): boolean {
  const now = dayjs()
  const end = dayjs(event.end)
  return now.isAfter(end)
}

export function isEventInProgress(event: EventEntity): boolean {
  const now = dayjs()
  const start = dayjs(event.start)
  const end = dayjs(event.end)
  return now.isAfter(start) && now.isBefore(end)
}

export function hasNotEventStartedYet(event: EventEntity): boolean {
  const now = dayjs()
  const start = dayjs(event.start)
  return now.isBefore(start)
}

/**
 *
 * @param event
 * @description update event based on his dates (start, end) and date of excution of this function
 * @return event as EventEntity
 */
export function updateStatusEventBasedOnStartEndTodayDate(event: EventEntity): EventEntity {
  if (isEventOver(event)) {
    event.status = EventStatusEnum.CLOSED
  }

  if (isEventInProgress(event)) {
    event.status = EventStatusEnum.PENDING
  }

  if (hasNotEventStartedYet(event)) {
    event.status = EventStatusEnum.CREATE
  }
  return event
}
