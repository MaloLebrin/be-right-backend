import type { ConnectionOptions } from 'bullmq'

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
}

export const concurrency = parseInt(process.env.CONCURRENT_WORKERS)
