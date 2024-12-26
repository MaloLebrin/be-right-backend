import type { DataSource, Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import type { InferType } from 'yup'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import type { updateCompanySubscription } from '../../middlewares/validation/subscription.Validator'
import type { idParamsSchema } from '../../middlewares/validation'

export class SubscriptionAdminController {
  private repository: Repository<SubscriptionEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.repository = DATA_SOURCE.getRepository(SubscriptionEntity)
    }
  }

  public updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const { body: { id, type, expireAt } }: InferType<typeof updateCompanySubscription> = req

      if (!id || !type || !expireAt) {
        throw new ApiError(422, 'Les paramètres sont incorrects')
      }

      const subscription = await this.repository.findOne({
        where: {
          id,
        },
      })

      if (!subscription) {
        throw new ApiError(404, 'La souscription est introuvable')
      }

      await this.repository.update(id, {
        type,
        expireAt,
      })

      const updatedSubscription = await this.repository.findOne({
        where: {
          id,
        },
      })

      return res.status(200).json(updatedSubscription)
    })
  }

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { params: { id } }: InferType<typeof idParamsSchema> = req
      const subscription = await this.repository.findOne({
        where: {
          id,
        },
      })

      if (!subscription) {
        throw new ApiError(404, 'La souscription est introuvable')
      }

      return res.status(200).json(subscription)
    })
  }
}
