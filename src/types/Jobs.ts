import type { NotificationTypeEnum } from './Notification'

export type QueueJobName =
  NotificationTypeEnum |
  'UpdateEventStatusJob' |
  'SendMailAnswerCreationjob' |
  'SendSubmitAnswerConfirmationJob' |
  'SendMailUserOnAccountJob'
