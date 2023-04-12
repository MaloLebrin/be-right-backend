import type { UserEntity } from '../entity/UserEntity'

export enum NotificationTypeEnum {
  ANSWER_RESPONSE_ACCEPTED = 'ANSWER_RESPONSE_ACCEPTED',
  ANSWER_RESPONSE_REFUSED = 'ANSWER_RESPONSE_REFUSED',
  ANSWER_RESPONSE = 'ANSWER_RESPONSE',

  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',
  EVENT_PENDING = 'EVENT_PENDING',
  EVENT_CLOSED = 'EVENT_CLOSED',

  EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
}

export const NotificationTypeEnumArray = Object.values(NotificationTypeEnum)

export interface CreateNotificationSubscriptionPayload {
  type: NotificationTypeEnum
  user: UserEntity
}
