/* eslint-disable security/detect-object-injection */
import type { Redis as RedisClient } from 'ioredis'
import Redis from 'ioredis'
import type { BaseEntity } from './entity/bases/BaseEntity'
import { logger } from './middlewares/loggerService'
import type { EntitiesEnum, RedisEntitiesField, RedisKeys } from './types'
import { parseRedisKey } from './utils/redisHelper'
import { isProduction } from './utils/envHelper'
import type { UserEntity } from './entity/UserEntity'

export default class RedisCache {
  private client: RedisClient
  private connected = false
  private logger: typeof logger

  constructor({ REDIS_PORT, REDIS_HOST, REDIS_PASSWORD }: { REDIS_PORT: number; REDIS_HOST: string; REDIS_PASSWORD: string }) {
    this.logger = logger

    if (!REDIS_PORT || !REDIS_HOST) {
      this.logger.error('Redis port or host not defined')
      throw new Error('Redis port or host not defined')
    }

    if (!this.connected
        && REDIS_PORT
        && REDIS_HOST) {
      this.client = new Redis(
        REDIS_PORT,
        REDIS_HOST,
        {
          password: REDIS_PASSWORD,
          showFriendlyErrorStack: true,
        },
      )
      this.connected = true
    }

    if (this.client) {
      this.client.on('error', (err: Error) => {
        this.logger.error(err.message)
      })

      this.client.on('connect', () => {
        this.logger.info('Connected successfully to redis')
      })
    }
  }

  private loggerInfo(message: string) {
    if (!isProduction()) {
      this.logger.info(message)
    }
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
    await Promise.all(payload.map(item => {
      const redisKey = `${typeofEntity}-${objKey}-${item.id}` as RedisKeys
      return this.save(redisKey, item, expireTime)
    }))
    // TODO do better more powerfull
    // await this.client.mset(payload)
  }

  async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  private parseArray<T>(strings: string[]): T[] {
    return strings
      .filter(Boolean)
      .map(str => JSON.parse(str))
  }

  async get<T>(key: RedisKeys, fetcher: () => Promise<T>): Promise<T> {
    if (!this.connected) {
      this.logger.info('redis not connected')
      return await fetcher()
    }

    const value = await this.client.get(key)

    if (value) {
      await this.client.expire(key, 3600)
      return JSON.parse(value)
    }

    if (!value) {
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
      this.loggerInfo('no value in redis cache')
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
        this.loggerInfo('redis value retrieved')
        return array
      } else {
        this.loggerInfo('no value in redis cache')

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

  async invalidateUserInCache(user: UserEntity) {
    return Promise.all([
      this.invalidate(`user-id-${user.id}`),
      this.invalidate(`user-token-${user.token}`),
    ])
  }
}
