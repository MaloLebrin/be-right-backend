import type { DataSource, Repository } from 'typeorm'
import { REDIS_CACHE } from '..'
import { UserEntity } from '../entity/UserEntity'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { generateRedisKey } from '../utils/redisHelper'

export default class RedisService {
  redisCache: RedisCache
  userRepository: Repository<UserEntity>

  constructor(APP_SOURCE: DataSource) {
    this.redisCache = REDIS_CACHE
    this.userRepository = APP_SOURCE.getRepository(UserEntity)
  }

  public updateCurrentUserInCache = async ({ userId, userToken }: { userId?: number; userToken?: string }) => {
    let user: UserEntity | null = null

    if (userId) {
      user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      })
    } else if (userToken) {
      user = await this.userRepository.findOne({
        where: {
          token: userToken,
        },
      })
    }

    if (user) {
      await Promise.all([
        this.redisCache.save(generateRedisKey({
          typeofEntity: EntitiesEnum.USER,
          field: 'id',
          id: user.id,
        }), user),

        this.redisCache.save(`user-token-${user.token}`, user),
      ])
    }
  }
}
