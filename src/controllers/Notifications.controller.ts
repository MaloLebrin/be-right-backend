import type { NextFunction, Request, Response } from 'express'
import type { DataSource, Repository } from 'typeorm'
import { NotificationEntity } from '../entity/notifications/Notification.entity'
import { NotificationSubcriptionEntity } from '../entity/notifications/NotificationSubscription.entity'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import { NotificationService } from '../services/notifications/NotificationService'
import { wrapperRequest } from '../utils'
import { uniq } from '../utils/arrayHelper'

export default class NotificationController {
  NotificationRepository: Repository<NotificationEntity>
  NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>
  UserRepository: Repository<UserEntity>
  NotificationService: NotificationService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.NotificationRepository = DATA_SOURCE.getRepository(NotificationEntity)
      this.UserRepository = DATA_SOURCE.getRepository(UserEntity)
      this.NotificationSubscriptionRepository = DATA_SOURCE.getRepository(NotificationSubcriptionEntity)
      this.NotificationService = new NotificationService(DATA_SOURCE)
    }
  }

  private getNotificationByUserForClient = async (user: UserEntity) => {
    const notificationSubscriptions = await this.NotificationSubscriptionRepository.find({
      where: {
        createdByUser: {
          id: user.id,
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

  public GetForUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx?.user

      if (user) {
        const notifications = await this.getNotificationByUserForClient(user)
        return res.status(200).json(notifications)
      }
      throw new ApiError(401, 'Missing Authentication')
    })
  }

  public readMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const ids = req.query.ids as string

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx?.user

      const notifIds = uniq(ids?.split(','))
        .map(id => parseInt(id))
        .filter(id => !isNaN(id))

      if (notifIds?.length > 0) {
        const notifications = await this.NotificationService.getManyForUser(notifIds, user.id)

        const updatedNotifications = await Promise.all(
          notifications.map(async notif =>
            await this.NotificationService.readNotification(notif.id)))

        return res.status(200).json(updatedNotifications)
      }
      throw new ApiError(422, 'identifiants des notifications manquants')
    })
  }
}
