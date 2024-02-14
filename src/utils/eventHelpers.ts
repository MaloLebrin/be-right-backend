import dayjs from 'dayjs'
import fr from 'dayjs/locale/fr'
import isBetween from 'dayjs/plugin/isBetween'
import type EventEntity from '../entity/EventEntity'
import type { CalendarDay, Period } from '../types/Event'
import { EventStatusEnum, EventStatusOrder } from '../types/Event'
import { addADay, isBefore, isDateBetween, isSameDay, toFormat } from './dateHelper'

dayjs.locale(fr)
dayjs.extend(isBetween)

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
export function updateStatusEventBasedOnStartEndTodayDate(event: EventEntity): EventStatusEnum {
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
  delete event.partnerId
  delete event.addressId
  return event
}

export function isEventPeriodInDay(period: Period, date: Date) {
  if (!date || !period?.end || !period.start) {
    return false
  }
  return isDateBetween(date, period)
}

export function composeEventForPeriod({
  events,
  period,
}: {
  events: EventEntity[]
  period: Period
}): CalendarDay[] {
  const { start, end } = period

  const arrayOfDay: CalendarDay[] = []

  let currentDate: Date = start
  while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
    const day: CalendarDay = {
      label: toFormat(currentDate, 'DD MMMM YYYY'),
      date: currentDate,
      eventIds: [],
    }
    events.forEach(event => {
      if (isEventPeriodInDay({
        start: event.start,
        end: event.end,
      }, currentDate)) {
        day.eventIds.push(event.id)
      }
    })

    arrayOfDay.push(day)

    currentDate = addADay(currentDate)
  }
  return arrayOfDay
}

export function orderingEventsByStatusAndDate(events: EventEntity[]): EventEntity[] {
  if (!events || events.length === 0) {
    return []
  }
  return events.sort((a, b) => {
    const scoreA = EventStatusOrder[a.status]
    const scoreB = EventStatusOrder[b.status]
    if (scoreA === scoreB) {
      return isBefore(a.end, b.end) ? -1 : 1
    }
    return scoreA - scoreB
  })
}
