import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class SendMailAnswerCreationjob extends BaseJob implements JobImp {
  constructor(public payoad: Record<string, number>) {
    super()
  }

  handle = async () => {
    // const answerService = new AnswerService(APP_SOURCE)
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
