import type { ConnectionOptions } from 'bullmq'
import { useEnv } from '../../env'

const {
  CONCURRENT_WORKERS,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
} = useEnv()

export const connection: ConnectionOptions = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  password: REDIS_PASSWORD,
}

export const concurrency = parseInt(CONCURRENT_WORKERS)
