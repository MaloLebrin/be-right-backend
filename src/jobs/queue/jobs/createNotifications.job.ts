import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import type { NotificationTypeEnum } from '../../../types'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class CreateNotificationsJob extends BaseJob implements JobImp {
  constructor(public payoad: { type: NotificationTypeEnum; userId: number }) {
    super()
  }

  handle = async () => {
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
