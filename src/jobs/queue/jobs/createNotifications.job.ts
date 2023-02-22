import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

// interface JobPayload {
//   eventNotification: EventNo
// }

export class CreateNotificationsJob extends BaseJob implements JobImp {
  constructor(public payoad: Record<string, unknown>) {
    super()
  }

  handle = async () => {
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
