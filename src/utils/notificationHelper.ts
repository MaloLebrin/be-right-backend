import type EventEntity from '../entity/EventEntity'
import { EventStatusEnum, NotificationTypeEnum } from '../types'

export function getNotificationTypeByEventStatus(event: EventEntity) {
  switch (event.status) {
    case EventStatusEnum.CREATE:
      return NotificationTypeEnum.EVENT_CREATED

    case EventStatusEnum.PENDING:
      return NotificationTypeEnum.EVENT_PENDING

    case EventStatusEnum.COMPLETED:
      return NotificationTypeEnum.EVENT_COMPLETED

    case EventStatusEnum.CLOSED:
      return NotificationTypeEnum.EVENT_CLOSED

    default:
      return NotificationTypeEnum.EVENT_CREATED
  }
}
