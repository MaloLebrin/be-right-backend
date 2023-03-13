/* eslint-disable security/detect-object-injection */
import type { Redis as RedisClient } from 'ioredis'
import Redis from 'ioredis'
import type { Logger } from 'pino'
import type { BaseEntity } from './entity/bases/BaseEntity'
import { logger } from './middlewares/loggerService'
import type { EntitiesEnum, RedisEntitiesField, RedisKeys } from './types'
import { parseRedisKey } from './utils/redisHelper'

export default class RedisCache {
  private client: RedisClient
  private connected = false
  private logger: Logger

  constructor() {
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

  async save<T>(key: RedisKeys, value: T, expireTime?: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value))
    await this.client.expire(key, expireTime || 3600)
  }

  async multiSave<T extends BaseEntity>({
    payload,
    typeofEntity,
    objKey,
    expireTime,
  }: {
    payload: T[]
    typeofEntity: EntitiesEnum
    objKey: RedisEntitiesField
    expireTime?: number
  }): Promise<void> {
    payload.forEach(item => {
      const redisKey = `${typeofEntity}-${objKey}-${item.id}` as RedisKeys
      this.save(redisKey, item, expireTime)
    })
    // TODO do better more powerfull
    // await this.client.mset(payload)
  }

  async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  private parseArray<T>(strings: string[]): T[] {
    return strings.filter(st => st).map(str => JSON.parse(str))
  }

  async get<T>(key: RedisKeys, fetcher: () => Promise<T>): Promise<T> {
    if (!this.connected) {
      this.logger.info('redis not connected')
      return await fetcher()
    }

    const value = await this.client.get(key)

    if (value) {
      this.logger.info('redis value retrieved')
      await this.client.expire(key, 3600)
      return JSON.parse(value)
    }

    if (!value) {
      this.logger.info('no value in redis cache')
      const result = await fetcher()
      await this.save(key, result)
      return result
    }
  }

  async getMany<T extends BaseEntity>({
    keys,
    typeofEntity,
    fetcher,
    objKey,
  }: {
    keys: RedisKeys[]
    typeofEntity: EntitiesEnum
    fetcher: () => Promise<T[]>
    objKey?: RedisEntitiesField
  }): Promise<T[]> {
    const field = objKey || 'id'

    if (!this.connected) {
      this.logger.info('redis not connected')
      return await fetcher()
    }

    const value = await this.client.mget(keys)

    if (!value || value.filter(str => str).length < 1) {
      this.logger.info('no value in redis cache')
      const result = await fetcher()
      this.multiSave<T>({
        payload: result,
        typeofEntity,
        objKey: field,
      })
      return result
    }

    if (value) {
      const array = this.parseArray<T>(value)

      const isEveryDataInCache = keys.every(key => {
        const { value, field } = parseRedisKey(key)
        const finalValue = array.find(item => item[field] === value)
        return finalValue !== undefined && finalValue !== null
      })

      if (isEveryDataInCache) {
        this.logger.info('redis value retrieved')
        return array
      } else {
        this.logger.info('no value in redis cache')

        const result = await fetcher()

        await this.multiSave<T>({
          payload: result,
          typeofEntity,
          objKey: field,
        })
        return result
      }
    }
  }
}
