import type { Request, Response } from 'express'
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm'
import { IsNull, Not } from 'typeorm'
import EventService from '../services/EventService'
import Context from '../context'
import EventEntity, { eventRelationFields, eventSearchableFields } from '../entity/EventEntity'
import { wrapperRequest } from '../utils'
import AnswerService from '../services/AnswerService'
import { EntitiesEnum, NotificationTypeEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray, isUserAdmin } from '../utils/'
import { AddressService } from '../services'
import { REDIS_CACHE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'
import type RedisCache from '../RedisCache'
import { ApiError } from '../middlewares/ApiError'
import RedisService from '../services/RedisService'
import { defaultQueue } from '../jobs/queue/queue'
import { CreateEventNotificationsJob } from '../jobs/queue/jobs/createNotifications.job'
import { generateQueueName } from '../jobs/queue/jobs/provider'
import { newPaginator } from '../utils/paginatorHelper'
import type { CompanyEntity } from '../entity/Company.entity'

export default class EventController {
  AddressService: AddressService
  AnswerService: AnswerService
  EventService: EventService
  repository: Repository<EventEntity>
  redisCache: RedisCache
  RediceService: RedisService

  constructor(SOURCE: DataSource) {
    if (SOURCE) {
      this.EventService = new EventService(SOURCE)
      this.AnswerService = new AnswerService(SOURCE)
      this.AddressService = new AddressService(SOURCE)
      this.repository = SOURCE.getRepository(EventEntity)
      this.redisCache = REDIS_CACHE
      this.RediceService = new RedisService(SOURCE)
    }
  }

  private saveEventRedisCache = async (event: EventEntity) => {
    await this.redisCache.save(generateRedisKey({
      typeofEntity: EntitiesEnum.EVENT,
      field: 'id',
      id: event.id,
    }), event)
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just created
   */
  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { event, address, photographerId }: { event: Partial<EventEntity>; address?: Partial<AddressEntity>; photographerId: number } = req.body
      const ctx = Context.get(req)
      let userId = null
      if (isUserAdmin(ctx.user)) {
        userId = parseInt(req.params.id)
      } else {
        userId = ctx.user.id
      }
      if (event && userId) {
        const newEvent = await this.EventService.createOneEvent(event, userId, photographerId)

        if (newEvent && address) {
          await defaultQueue.add(
            generateQueueName(NotificationTypeEnum.EVENT_CREATED),
            new CreateEventNotificationsJob({
              type: NotificationTypeEnum.EVENT_CREATED,
              event: newEvent,
              userId,
            }))

          await this.AddressService.createOne({
            address,
            eventId: newEvent.id,
          })
        }
        await this.RediceService.updateCurrentUserInCache({ userId })

        await this.saveEventRedisCache(newEvent)
        return res.status(200).json(newEvent)
      }

      throw new ApiError(422, 'Formulaire incomplet')
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)

        const event = await this.redisCache.get<EventEntity>(
          generateRedisKey({
            field: 'id',
            typeofEntity: EntitiesEnum.EVENT,
            id,
          }),
          () => this.EventService.getOneEvent(id))

        if (isUserAdmin(ctx.user) || event.companyId === ctx.user.companyId) {
          return res.status(200).json(event)
        } else {
          throw new ApiError(401, 'Action non autorisée')
        }
      }
      throw new ApiError(422, 'identifiant de l\'événement manquant')
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      const eventsIds = ids.split(',').map(id => parseInt(id))

      if (eventsIds && eventsIds.length > 0) {
        const events = await this.redisCache.getMany<EventEntity>({
          keys: generateRedisKeysArray({
            field: 'id',
            typeofEntity: EntitiesEnum.EVENT,
            ids: eventsIds,
          }),
          typeofEntity: EntitiesEnum.EVENT,
          fetcher: () => this.EventService.getManyEvents(eventsIds),
        })

        return res.status(200).json(events)
      }
      throw new ApiError(422, 'identifiants des événements manquant')
    })
  }

  /**
   * @param id userId
   * @returns all event link with user
   */
  public getAllForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      const eventsIds = ctx.user.company.eventIds

      const currentUser = ctx.user

      if (!currentUser || !currentUser.company || !currentUser.company.eventIds || currentUser.company.eventIds?.length < 1) {
        throw new ApiError(422, 'identifiants des événements manquant')
      }

      const events = await this.redisCache.getMany<EventEntity>({
        keys: generateRedisKeysArray({
          field: 'id',
          typeofEntity: EntitiesEnum.EVENT,
          ids: eventsIds,
        }),
        typeofEntity: EntitiesEnum.EVENT,
        fetcher: () => this.EventService.getManyEvents(eventsIds, true),
      })

      return res.status(200).json(events)
    })
  }

  public getAllDeletedForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      if (ctx.user?.id) {
        const events = await this.repository.find({
          where: {
            company: {
              id: ctx.user.companyId,
            },
            deletedAt: Not(IsNull()),
          },
          withDeleted: true,
        })
        return res.status(200).json(events)
      }
      throw new ApiError(422, 'Vous n\'etes pas connecté')
    })
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      const { where, page, take, skip, order } = newPaginator<EventEntity>({
        req,
        searchableFields: eventSearchableFields,
        relationFields: eventRelationFields,
      })

      let whereFields = where

      if (!isUserAdmin(ctx.user)) {
        whereFields = where.map(obj => {
          obj.company = {
            ...obj.company as FindOptionsWhere<CompanyEntity>,
            id: ctx.user.companyId,
          }
          return obj
        })
      }

      const [events, total] = await this.repository.findAndCount({
        take,
        skip,
        where: whereFields,
        order,
      })

      return res.status(200).json({
        data: events,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        limit: take,
        total,
        order,
      })
    })
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { event }: { event: Partial<EventEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)

        const eventFinded = await this.EventService.getOneEvent(id)

        if (isUserAdmin(ctx.user) || eventFinded.companyId === ctx.user.companyId) {
          const eventUpdated = await this.EventService.updateOneEvent(id, event as EventEntity)

          await this.saveEventRedisCache(eventUpdated)

          return res.status(200).json(eventUpdated)
        } else {
          throw new ApiError(422, 'Événement non mis à jour')
        }
      }
      throw new ApiError(422, 'identifiant de l\'événement manquant')
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        const user = ctx.user
        const eventToDelete = await this.EventService.getOneWithoutRelations(id)

        if (!eventToDelete) {
          throw new ApiError(422, 'L\'événement n\'éxiste pas')
        }

        if (eventToDelete?.companyId === user.companyId || isUserAdmin(ctx.user)) {
          await this.EventService.deleteOneAndRelations(eventToDelete)
          await this.RediceService.updateCurrentUserInCache({ userId: user.id })

          return res.status(204).json({ data: eventToDelete, message: 'Événement supprimé' })
        } else {
          throw new ApiError(401, 'Action non autorisée')
        }
      }
      throw new ApiError(422, 'identifiant de l\'événement manquant')
    })
  }
}
