import dayjs from 'dayjs'
import type { Period } from '../types'

export function toFormat(date: Date | string, format: string) {
  return dayjs(date).locale('fr').format(format)
}

export function isSameDay(date1: Date | string, date2: Date | string) {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

export function isBefore(date1: Date, date2: Date) {
  return dayjs(date1).isBefore(dayjs(date2))
}

export function addADay(date: Date) {
  return dayjs(date).add(1, 'day').toDate()
}

export function isDateBetween(date1: Date | string, period: Period) {
  return dayjs(date1).isBetween(period.start, period.end)
}
