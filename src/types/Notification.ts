import type { UserEntity } from '../entity/UserEntity'

export enum NotificationTypeEnum {
  ANSWER_RESPONSE_ACCEPTED = 'ANSWER_RESPONSE_ACCEPTED',
  ANSWER_RESPONSE_REFUSED = 'ANSWER_RESPONSE_REFUSED',
  ANSWER_RESPONSE = 'ANSWER_RESPONSE',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',
  EVENT_CLOSED = 'EVENT_CLOSED',
}

export const NotificationTypeEnumArray = Object.values(NotificationTypeEnum)

export interface CreateNotificationSubscriptionPayload {
  type: NotificationTypeEnum
  user: UserEntity
}

// export interface CreateNotificationPayload {
//   type: NotificationTypeEnum
//   subscriber: NotificationSubcriptionEntity
//   events?: EventEntity
//   answers?: AnswerEntity
// }
