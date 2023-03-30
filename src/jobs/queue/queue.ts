import { Queue } from 'bullmq'
import { connection } from './config'
import { defaultWorker } from './worker'

export const defaultQueueName = 'default-queue'

export const defaultQueue = new Queue(defaultQueueName, {
  connection,
  defaultJobOptions: {
    delay: 5000,
  },
})

export async function setupBullMqProcessor(queueName: string = defaultQueueName) {
  await defaultWorker(queueName)
}
