import type { NextFunction, Request, Response } from 'express'
import type { DataSource, Repository } from 'typeorm'
import { NotificationSubscriptionService } from '../../services/notifications/NotificationSubscriptionService'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationTypeEnum } from '../../types'

export class NotificationSubscriptionController {
  NotificationSubscriptionService: NotificationSubscriptionService
  NotificationSubscriptionRepository: Repository<NotificationSubcriptionEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.NotificationSubscriptionRepository = DATA_SOURCE.getRepository(NotificationSubcriptionEntity)
      this.NotificationSubscriptionService = new NotificationSubscriptionService(DATA_SOURCE)
    }
  }

  public GetForUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx?.user

      if (user) {
        const notificationsSubscriptions = await this.NotificationSubscriptionService.getOneByUser(user)
        return res.status(200).json(notificationsSubscriptions)
      }
      throw new ApiError(401, 'Missing Authentication')
    })
  }

  public unsuscbribe = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

  public subscribe = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const type = req.body.type as NotificationTypeEnum

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
