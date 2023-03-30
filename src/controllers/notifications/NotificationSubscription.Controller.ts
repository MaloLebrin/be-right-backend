import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { NotificationSubscriptionService } from '../../services/notifications/NotificationSubscriptionService'
import { APP_SOURCE } from '../..'
import { wrapperRequest } from '../../utils'
import Context from '../../context'
import { ApiError } from '../../middlewares/ApiError'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationTypeEnum } from '../../types'

export class NotificationSubscriptionController {
  NotificationSubscriptionService: NotificationSubscriptionService
  NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>

  constructor() {
    this.NotificationSubscriptionRepository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
    this.NotificationSubscriptionService = new NotificationSubscriptionService(APP_SOURCE)
  }

  public GetForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const user = ctx?.user

      if (user) {
        const notificationsSubscriptions = await this.NotificationSubscriptionService.getOneByUser(user)
        return res.status(200).json(notificationsSubscriptions)
      }
      throw new ApiError(401, 'Missing Authentication')
    })
  }

  public unsuscbribe = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      const user = ctx?.user

      if (id && user) {
        await this.NotificationSubscriptionRepository.softDelete({
          id,
          createdByUser: {
            id: user?.id,
          },
        })
        return res.status(200).json({
          success: true,
          message: 'Abonnement de notification annulé',
        })
      }
      throw new ApiError(422, 'Id manquant')
    })
  }

  public subscribe = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const type = req.body.type as NotificationTypeEnum

      const ctx = Context.get(req)
      const user = ctx?.user

      if (!type || !user) {
        throw new ApiError(422, 'Type manquant')
      }

      const existingSubscription = await this.NotificationSubscriptionRepository.findOne({
        where: {
          createdByUser: {
            id: user?.id,
          },
          type,
        },
        withDeleted: true,
      })

      if (existingSubscription) {
        await this.NotificationSubscriptionRepository.restore(existingSubscription.id)
        const subscriptionToSend = await this.NotificationSubscriptionService.getOne(existingSubscription.id)
        return res.status(200).json(subscriptionToSend)
      }

      const notifSubscription = await this.NotificationSubscriptionService.createOne({
        type,
        user,
      })

      return res.status(200).json(notifSubscription)
    })
  }
}
