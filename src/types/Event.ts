import { UserEntity } from "../entity"

export enum EventStatusEnum {
  CREATE = 'CREATE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

export type PhotographerCreatePayload = Pick<UserEntity, 'companyName' | 'firstName' | 'lastName' | 'email'>
