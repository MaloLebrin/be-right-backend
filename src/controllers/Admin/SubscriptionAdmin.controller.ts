import { type DataSource, In, type Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import type { InferType } from 'yup'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import type { updateCompanySubscription } from '../../middlewares/validation/subscription.Validator'
import type { idParamsSchema } from '../../middlewares/validation'
import type RedisCache from '../../RedisCache'
import { CompanyEntity } from '../../entity/Company.entity'
import { REDIS_CACHE } from '../..'
import { parseQueryIds } from '../../utils/basicHelper'

export class SubscriptionAdminController {
  private repository: Repository<SubscriptionEntity>
  private CompanyRepository: Repository<CompanyEntity>
  private RedisCache: RedisCache

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.repository = DATA_SOURCE.getRepository(SubscriptionEntity)
      this.CompanyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.RedisCache = REDIS_CACHE
    }
  }

  public updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { body: { id, type, expireAt } }: InferType<typeof updateCompanySubscription> = req

      if (!id || !type || !expireAt) {
        throw new ApiError(422, 'Les paramètres sont incorrects')
      }

      const [subscription, company] = await Promise.all([
        this.repository.findOne({
          where: {
            id,
          },
        }),
        this.CompanyRepository.findOne({
          where: {
            subscription: { id },
          },
          relations: ['users'],
        }),
      ])

      if (!subscription) {
        throw new ApiError(404, 'La souscription est introuvable')
      }

      const invalidateCachePromises = company.users.reduce((acc, user) => [
        ...acc,
        this.RedisCache.invalidate(`user-id-${user.id}`),
        this.RedisCache.invalidate(`user-token-${user.token}`),
      ], [] as Promise<void>[])

      await Promise.all([
        this.repository.update(id, {
          type,
          expireAt,
        }),
        this.CompanyRepository.update(company.id, { subscriptionLabel: type }),
        ...invalidateCachePromises,
      ])

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

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const ids = req.query.ids as string

      if (ids) {
        const subscriptionIds = parseQueryIds(ids)

        if (subscriptionIds?.length > 0) {
          const subscriptions = await this.repository.find({
            where: {
              id: In(subscriptionIds),
            },
          })

          return res.status(200).json(subscriptions)
        }
      }
      throw new ApiError(422, 'identifiants des entreprises manquants')
    })
  }
}
