import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { verify } from 'jsonwebtoken'
import { APP_SOURCE } from '..'
import Context from '../context'
import { NotificationEntity } from '../entity/notifications/Notification.entity'
import { NotificationSubcriptionEntity } from '../entity/notifications/NotificationSubscription.entity'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import type { SSEManager } from '../serverSendEvent/SSEManager'
import { NotificationService } from '../services/notifications/NotificationService'
import { wrapperRequest } from '../utils'
import { uniq } from '../utils/arrayHelper'
import { useEnv } from '../env'

export default class NotificationController {
  NotificationRepository: Repository<NotificationEntity>
  NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>
  UserRepository: Repository<UserEntity>
  NotificationService: NotificationService

  constructor() {
    this.NotificationRepository = APP_SOURCE.getRepository(NotificationEntity)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
    this.NotificationSubscriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    this.NotificationService = new NotificationService(APP_SOURCE)
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

  public GetForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const user = ctx?.user

      if (user) {
        const notifications = await this.getNotificationByUserForClient(user)
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

  public streamNotifications = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const token = req.query.token as string
      const { JWT_SECRET } = useEnv()

      if (!token || !JWT_SECRET) {
        throw new ApiError(422, 'Vous n\'êtes pas authentifié')
      }

      verify(token, JWT_SECRET)

      const SSEManager: SSEManager = req.app.get('sseManager')

      if (!SSEManager) {
        throw new ApiError(422, 'SSE manager not found')
      }

      const user = await this.UserRepository.findOne({
        where: {
          token,
        },
      })

      if (!user) {
        throw new ApiError(401, 'vous n\'êtes pas identifié')
      }

      const notifications = await this.getNotificationByUserForClient(user)

      SSEManager.open(user.id, res)

      SSEManager.broadcast({
        id: `${user.id}-${Date.now()}`,
        type: 'notifications',
        data: JSON.stringify(notifications),
      })

      return req.on('close', () => {
        /* En cas de deconnexion on supprime le client de notre manager */
        SSEManager.delete(user.id)
      })
    })
  }
}
