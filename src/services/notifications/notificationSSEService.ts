import { type DataSource, IsNull, type Repository } from 'typeorm'
import { UserEntity } from '../../entity/UserEntity'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationEntity } from '../../entity/notifications/Notification.entity'
import { REDIS_CACHE } from '../../'
import type RedisCache from '../../RedisCache'

export class NotificationSSEService {
  private NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>
  private redisCache: RedisCache
  private UserRepository: Repository<UserEntity>

  constructor(APP_SOURCE: DataSource) {
    this.NotificationSubscriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
    this.redisCache = REDIS_CACHE
  }

  public getAllUser = async ({
    notificationToken,
  }: {
    notificationToken: string
  }): Promise<NotificationEntity[]> => {
    const user = await this.redisCache.get<{ id: number; notificationToken: string }>(
      `user-notification-${notificationToken}`,
      () => this.UserRepository.findOne({
        where: {
          notificationToken,
        },
        select: {
          id: true,
          notificationToken: true,
        },
      }),
    )

    if (!user) {
      return []
    }

    const notificationSubscriptions = await this.NotificationSubscriptionRepository.find({
      where: {
        createdByUser: {
          id: user.id,
        },
        notifications: {
          readAt: IsNull(),
        },
      },
      relations: {
        notifications: {
          eventNotification: true,
        },
      },
    })

    return notificationSubscriptions.reduce((acc, subscriber) => [...acc, ...subscriber.notifications], [])
  }
}
