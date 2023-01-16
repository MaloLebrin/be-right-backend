import type { Redis as RedisClient } from 'ioredis'
import Redis from 'ioredis'
import type { Logger } from 'pino'
import { useLogger } from './middlewares/loggerService'
import { delay } from './utils'

export default class RedisCache {
  private client: RedisClient
  private connected = false
  private logger: Logger

  constructor() {
    const { logger } = useLogger()
    this.logger = logger

    if (!this.connected) {
      this.client = new Redis(
        parseInt(process.env.REDIS_PORT),
        process.env.REDIS_HOST,
        {
          showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
        },
      )
      this.connected = true
    }

    this.client.on('error', (err: Error) => {
      this.logger.error(err.message)
    })

    this.client.on('connect', () => {
      this.logger.info('Connected successfully to redis')
    })
  }

  async save(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value))
  }

  async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (!this.connected) {
      // await delay(1000)
      this.logger.info('redis not connected')
      return await fetcher()
    }

    const value = await this.client.get(key)

    if (value) {
      this.logger.info('redis value retrieved')
      return JSON.parse(value)
    }

    if (!value) {
      // await delay(1000)
      this.logger.info('no value in redis cache')
      const result = await fetcher()
      this.save(key, result)

      return result
    }
  }
}
