import type EventEntity from '../entity/EventEntity'
import type { UserEntity } from '../entity/UserEntity'

export enum EventStatusEnum {
  CREATE = 'CREATE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export type PhotographerCreatePayload = Pick<UserEntity, 'firstName' | 'lastName' | 'email'>

export interface EventCreationPayload extends Pick<EventEntity, 'name' | 'description' | 'end' | 'start'> {
  employeeIds: number[]
}

export interface EventWithRelationsCreationPayload {
  event: EventCreationPayload
  address: {
    addressLine: string
    addressLine2: null
    postalCode: string
    city: string
    country: string
  }
  photographerId: number
}

export interface Period {
  start: Date
  end: Date
}

export interface CalendarDay {
  label: string
  eventIds: number[]
  date: Date
}
