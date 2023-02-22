import { plainToInstance } from 'class-transformer'
import { CreateNotificationsJob } from './createNotifications.job'
import type { JobImp } from './job.definition'
import { SendMailAnswerCreationjob } from './sendMailAnswerCreation.job'
import { UpdateEventStatusJob } from './updateEventStatus.job'

export const JobDictonary = new Map([
  [UpdateEventStatusJob.name, UpdateEventStatusJob],
  [SendMailAnswerCreationjob.name, SendMailAnswerCreationjob],
  [CreateNotificationsJob.name, CreateNotificationsJob],
])

export const getJobInstance = (data: JobImp): JobImp => {
  const jobClass = JobDictonary.get(data.name)
  if (jobClass) {
    return plainToInstance(jobClass, data)
  }
  return null
}
