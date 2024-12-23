import type { NextFunction, Request, Response } from 'express'
import { type DataSource, type Repository } from 'typeorm'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import { UserEntity } from '../../entity/UserEntity'
import { EventDeleteService, SettingService } from '../../services'
import { REDIS_CACHE } from '../..'
import { CompanyEntity } from '../../entity/Company.entity'
import type RedisCache from '../../RedisCache'
import { isUserOwner } from '../../utils/userHelper'
import { NotificationSubscriptionService } from '../../services/notifications'
import EventEntity from '../../entity/EventEntity'

export class UserDeleteController {
  private companyRepository: Repository<CompanyEntity>
  private redisCache: RedisCache
  private repository: Repository<UserEntity>
  private eventRepository: Repository<EventEntity>
  private SettingService: SettingService
  private NoficationSubscriptionsService: NotificationSubscriptionService
  private EventDeleteService: EventDeleteService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.companyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.redisCache = REDIS_CACHE
      this.repository = DATA_SOURCE.getRepository(UserEntity)
      this.SettingService = new SettingService(DATA_SOURCE)
      this.NoficationSubscriptionsService = new NotificationSubscriptionService(DATA_SOURCE)
      this.EventDeleteService = new EventDeleteService(DATA_SOURCE)
      this.eventRepository = DATA_SOURCE.getRepository(EventEntity)
    }
  }

  private deleteUserInCache = async (user: UserEntity) => {
    await Promise.all([
      this.redisCache.invalidate(`user-id-${user.id}`),
      this.redisCache.invalidate(`user-token-${user.token}`),
    ])
  }

  public deleteForEver = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (!id) {
        throw new ApiError(422, 'Paramètre manquant')
      }

      const [user, events] = await Promise.all([
        this.repository.findOne({
          where: {
            id,
          },
        }),
        this.eventRepository.find({
          where: {
            partner: {
              id,
            },
          },
        }),
      ])

      if (!user) {
        throw new ApiError(422, 'L\'utilisateur n\'existe pas')
      }

      await Promise.all([
        ...events.map(event => this.EventDeleteService.deleteOneAndRelationsForEver(event)),
        this.deleteUserInCache(user),
        this.SettingService.deleteForEverOneByUserId(id),
        this.NoficationSubscriptionsService.deleteOneByUserId(id),
      ])

      const [company] = await Promise.all([
        this.companyRepository.findOne({
          where: {
            id: user.companyId,
          },
          relations: {
            users: true,
          },
        }),
        this.deleteUserInCache(user),
        this.SettingService.deleteForEverOneByUserId(id),
        this.NoficationSubscriptionsService.deleteOneByUserId(id),
      ])

      if (company && isUserOwner(user)) {
        const owners = company.users?.filter(user => isUserOwner(user))
        if (owners?.length < 2) {
          await this.companyRepository.delete(user.companyId)
        }
      }

      await this.repository.delete(id)

      return res.status(201).json({
        isSuccess: true,
        message: 'L\'utilisateur a bien été supprimé',
      })
    })
  }
}
