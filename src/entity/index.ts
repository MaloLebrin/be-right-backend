import AnswerEntity from './AnswerEntity'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './bases/BaseEntity'
import { BugReportEntity } from './BugReportEntity'
import { EmployeeEntity } from './EmployeeEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { ImageRightConditionEntity } from './ImageRightConditionEntity'
import { NewsletterRecipient } from './NewsletterRecipientEntity'
import { PaymentEntity } from './PaymentEntity'
import { SubscriptionEntity } from './SubscriptionEntity'
import { UserEntity } from './UserEntity'
import { SessionEntity } from './SessionEntity'
import { MailEntity } from './MailEntity'

export default {
  AddressEntity,
  AnswerEntity,
  BaseEntity,
  BugReportEntity,
  EmployeeEntity,
  EventEntity,
  FileEntity,
  ImageRightConditionEntity,
  MailEntity,
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
  FileEntity,
  ImageRightConditionEntity,
  MailEntity,
  NewsletterRecipient,
  PaymentEntity,
  SessionEntity,
  SubscriptionEntity,
  UserEntity,
]
