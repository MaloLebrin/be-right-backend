import { type DataSource, IsNull, type Repository } from 'typeorm'
import { UserEntity } from '../../entity/UserEntity'
import { ApiError } from '../../middlewares/ApiError'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationEntity } from '../../entity/notifications/Notification.entity'

export class NotificationSSEService {
  private NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>

  private UserRepository: Repository<UserEntity>

  constructor(APP_SOURCE: DataSource) {
    this.NotificationSubscriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
  }

  public getAllUser = async ({
    notificationToken,
  }: {
    notificationToken: string
  }): Promise<NotificationEntity[]> => {
    const user = await this.UserRepository.findOne({
      where: {
        notificationToken,
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      throw new ApiError(422, 'L\'utilisateur n\'existe pas')
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
