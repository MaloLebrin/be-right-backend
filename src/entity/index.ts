import AnswerEntity from './AnswerEntity'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './bases/BaseEntity'
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
import { DraftEventEntity } from './event/DraftEvent.entity'
import { SettingEntity } from './SettingEntity'

export default {
  AddressEntity,
  AnswerEntity,
  BadgeEntity,
  BaseEntity,
  CompanyEntity,
  DraftEventEntity,
  EmployeeEntity,
  EventEntity,
  EventNotificationEntity,
  FileEntity,
  GroupEntity,
  MailEntity,
  NotificationEntity,
  NotificationSubcriptionEntity,
  SessionEntity,
  SettingEntity,
  SubscriptionEntity,
  UserEntity,
}

export const entities = [
  AddressEntity,
  AnswerEntity,
  BadgeEntity,
  CompanyEntity,
  DraftEventEntity,
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
  SettingEntity,
  SubscriptionEntity,
  UserEntity,
]
