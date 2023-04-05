import type { Job } from 'bullmq'
import { Worker } from 'bullmq'
import { logger } from '../../middlewares/loggerService'
import { concurrency, connection } from './config'
import type { JobImp } from './jobs/job.definition'
import { getJobInstance } from './jobs/provider'

export interface WorkerReply {
  status: number
  message: string
}

export const defaultWorker = async (queueName: string) => {
  const worker = new Worker<JobImp, WorkerReply>(
    queueName,
    async (job: Job) => {
      const instance = getJobInstance(job.data)

      if (!instance) {
        logger.debug(`Unabled to find job: ${job.data.name}`)
        throw new Error(`Unabled to find job: ${job.data.name}`)
      }

      await instance.handle()
      return { status: 200, message: 'success' }
    },
    {
      concurrency,
      connection,
    },
  )

  worker.on('failed', (job: Job<JobImp, WorkerReply, string> | undefined) => {
    if (job) {
      const instance = getJobInstance(job.data)
      instance?.failed(job)
      logger.info(`${job.id} has failed`)
    }
  })
}
