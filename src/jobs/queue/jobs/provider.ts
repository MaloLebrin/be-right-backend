import { plainToInstance } from 'class-transformer'
import { NotificationTypeEnum } from '../../../types'
import { CreateEventNotificationsJob } from './createNotifications.job'
import type { JobImp } from './job.definition'
import { SendMailAnswerCreationjob } from './sendMailAnswerCreation.job'
import { UpdateEventStatusJob } from './updateEventStatus.job'
import { CreateEmployeeNotificationsJob } from './createEmployeeNotifications.job'

export const JobDictonary = new Map([
  [UpdateEventStatusJob.name, UpdateEventStatusJob],
  [SendMailAnswerCreationjob.name, SendMailAnswerCreationjob],
  [CreateEventNotificationsJob.name, CreateEventNotificationsJob],
  [CreateEmployeeNotificationsJob.name, CreateEmployeeNotificationsJob],
])

export const getJobInstance = (data: JobImp): JobImp => {
  const jobClass = JobDictonary.get(data.name)
  if (jobClass) {
    return plainToInstance(jobClass, data)
  }
  return null
}

export function generateQueueName(type?: NotificationTypeEnum) {
  const name = Date.now().toString()

  switch (type) {
    case NotificationTypeEnum.ANSWER_RESPONSE:
      return `answer-response-notif-${name}`

    case NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED:
      return `answer-response-accepted-notif-${name}`

    case NotificationTypeEnum.ANSWER_RESPONSE_REFUSED:
      return `answer-response-refused-notif-${name}`

    case NotificationTypeEnum.EVENT_CREATED:
      return `create-event-notif-${name}`

    case NotificationTypeEnum.EVENT_CLOSED:
      return `close-event-notif-${name}`

    case NotificationTypeEnum.EVENT_COMPLETED:
      return `complete-event-notif-${name}`

    case NotificationTypeEnum.EMPLOYEE_CREATED:
      return `create-employee-notif-${name}`

    default:
      return name
  }
}
