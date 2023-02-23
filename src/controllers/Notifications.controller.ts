import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { APP_SOURCE } from '..'
import Context from '../context'
import { NotificationEntity } from '../entity/notifications/Notification.entity'
import { NotificationSubcriptionEntity } from '../entity/notifications/NotificationSubscription.entity'
import { ApiError } from '../middlewares/ApiError'
import { NotificationService } from '../services/notifications/NotificationService'
import { wrapperRequest } from '../utils'
import { uniq } from '../utils/arrayHelper'

export default class NotificationController {
  NotificationRepository: Repository<NotificationEntity>
  NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>
  NotificationService: NotificationService

  constructor() {
    this.NotificationRepository = APP_SOURCE.getRepository(NotificationEntity)
    this.NotificationSubscriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    this.NotificationService = new NotificationService(APP_SOURCE)
  }

  public GetForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const user = ctx?.user

      if (user) {
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

        const notifications = notificationSubscriptions.reduce((acc, subscriber) => [...acc, ...subscriber.notifications], [])

        return res.status(200).json(notifications)
      }
      throw new ApiError(401, 'Missing Authentication')
    })
  }

  public readMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      const ctx = Context.get(req)
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
