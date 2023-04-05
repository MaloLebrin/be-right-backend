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
export function updateStatusEventBasedOnStartEndTodayDate(event: EventEntity) {
  if (isEventOver(event)) {
    return EventStatusEnum.CLOSED
  }

  if (isEventInProgress(event)) {
    return EventStatusEnum.PENDING
  }

  if (hasNotEventStartedYet(event)) {
    return EventStatusEnum.CREATE
  }
}

export function removeUnecessaryFieldsEvent(event: EventEntity) {
  const obj = event as any
  if (obj.partnerId) {
    delete obj.partnerId
  }
  if (obj.addressId) {
    delete obj.addressId
  }
  return obj
}
