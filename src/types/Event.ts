import type EventEntity from '../entity/EventEntity'
import type { UserEntity } from '../entity/UserEntity'

export enum EventStatusEnum {
  CREATE = 'CREATE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export type PhotographerCreatePayload = Pick<UserEntity, 'companyName' | 'firstName' | 'lastName' | 'email'>

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
