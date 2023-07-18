import AnswerEntity from './AnswerEntity'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './bases/BaseEntity'
import { BugReportEntity } from './BugReportEntity'
import { EmployeeEntity } from './employees/EmployeeEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { SubscriptionEntity } from './SubscriptionEntity'
import { UserEntity } from './UserEntity'
import { SessionEntity } from './SessionEntity'
import { MailEntity } from './MailEntity'
import { EventNotificationEntity } from './bases/EventNotification.entity'
import { NotificationEntity } from './notifications/Notification.entity'
import { NotificationSubcriptionEntity } from './notifications/NotificationSubscription.entity'
import { GroupEntity } from './employees/Group.entity'
import { CompanyEntity } from './Company.entity'
import { BadgeEntity } from './repositories/Badge.entity'
import { MigrationEntity } from './repositories/Migration.entity'

export default {
  AddressEntity,
  AnswerEntity,
  BaseEntity,
  BadgeEntity,
  BugReportEntity,
  CompanyEntity,
  EmployeeEntity,
  EventEntity,
  EventNotificationEntity,
  FileEntity,
  GroupEntity,
  MailEntity,
  NotificationEntity,
  NotificationSubcriptionEntity,
  SessionEntity,
  SubscriptionEntity,
  UserEntity,
}

export const entities = [
  AddressEntity,
  AnswerEntity,
  SubscriptionEntity,
  BadgeEntity,
  BugReportEntity,
  CompanyEntity,
  EmployeeEntity,
  EventEntity,
  EventNotificationEntity,
  FileEntity,
  GroupEntity,
  MailEntity,
  MigrationEntity,
  NotificationEntity,
  NotificationSubcriptionEntity,
  SessionEntity,
  UserEntity,
]
