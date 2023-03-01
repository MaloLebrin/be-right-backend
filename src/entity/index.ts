import AnswerEntity from './AnswerEntity'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './bases/BaseEntity'
import { BugReportEntity } from './BugReportEntity'
import { EmployeeEntity } from './employees/EmployeeEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { ImageRightConditionEntity } from './ImageRightConditionEntity'
import { NewsletterRecipient } from './NewsletterRecipientEntity'
import { PaymentEntity } from './PaymentEntity'
import { SubscriptionEntity } from './SubscriptionEntity'
import { UserEntity } from './UserEntity'
import { SessionEntity } from './SessionEntity'
import { MailEntity } from './MailEntity'
import { EventNotificationEntity } from './bases/EventNotification.entity'
import { NotificationEntity } from './notifications/Notification.entity'
import { NotificationSubcriptionEntity } from './notifications/NotificationSubscription.entity'

export default {
  AddressEntity,
  AnswerEntity,
  BaseEntity,
  BugReportEntity,
  EmployeeEntity,
  EventEntity,
  EventNotificationEntity,
  FileEntity,
  ImageRightConditionEntity,
  MailEntity,
  NotificationEntity,
  NotificationSubcriptionEntity,
  NewsletterRecipient,
  PaymentEntity,
  SessionEntity,
  SubscriptionEntity,
  UserEntity,
}

export const entities = [
  AddressEntity,
  AnswerEntity,
  BugReportEntity,
  EmployeeEntity,
  EventEntity,
  EventNotificationEntity,
  NotificationEntity,
  NotificationSubcriptionEntity,
  FileEntity,
  ImageRightConditionEntity,
  MailEntity,
  NewsletterRecipient,
  PaymentEntity,
  SessionEntity,
  SubscriptionEntity,
  UserEntity,
]
