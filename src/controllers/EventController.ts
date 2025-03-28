import type { NextFunction, Request, Response } from 'express'
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm'
import { Between, IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm'
import dayjs from 'dayjs'
import { EventService } from '../services/event/EventService'
import EventEntity from '../entity/EventEntity'
import { wrapperRequest } from '../utils'
import AnswerService from '../services/AnswerService'
import { EntitiesEnum, NotificationTypeEnum } from '../types'
import { composeEventForPeriod, composeOrderFieldForEventStatus, generateRedisKey, generateRedisKeysArray, isUserAdmin } from '../utils/'
import { AddressService, EventDeleteService } from '../services'
import { REDIS_CACHE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'
import type RedisCache from '../RedisCache'
import { ApiError } from '../middlewares/ApiError'
import RedisService from '../services/RedisService'
import { defaultQueue } from '../jobs/queue/queue'
import { CreateEventNotificationsJob } from '../jobs/queue/jobs/createNotifications.job'
import { generateQueueName } from '../jobs/queue/jobs/provider'
import { UpdateEventStatusJob } from '../jobs/queue/jobs/updateEventStatus.job'
import { composeWhereFieldForQueryBuilder, parseQueries } from '../utils/paginatorHelper'

export default class EventController {
  AddressService: AddressService
  AnswerService: AnswerService
  EventService: EventService
  EventDeleteService: EventDeleteService
  repository: Repository<EventEntity>
  redisCache: RedisCache
  RediceService: RedisService

  constructor(SOURCE: DataSource) {
    if (SOURCE) {
      this.EventService = new EventService(SOURCE)
      this.EventDeleteService = new EventDeleteService(SOURCE)
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
  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { event, address, photographerId }: { event: Partial<EventEntity>; address?: Partial<AddressEntity>; photographerId: number } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
        await Promise.all([
          this.RediceService.updateCurrentUserInCache({ userId }),
          this.saveEventRedisCache(newEvent),
        ])

        return res.status(200).json(newEvent)
      }

      throw new ApiError(422, 'Formulaire incomplet')
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)
      if (id) {
        if (!ctx) {
          throw new ApiError(500, 'Une erreur s\'est produite')
        }

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

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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
  public getAllForUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

  public getAllDeletedForUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const {
        andFilters,
        filters,
        limit,
        page,
        search,
        withDeleted,
      } = parseQueries(req)
      const { andWhere, orWhere } = composeWhereFieldForQueryBuilder({ alias: 'event', andFilters, filters })

      const eventPagniateQuery = this.repository
        .createQueryBuilder('event')
        .leftJoin('event.company', 'company')
        .take(limit)
        .skip((page - 1) * limit)
        .addSelect(composeOrderFieldForEventStatus(), '_rank')
        .orderBy('_rank')

      if (!isUserAdmin(ctx.user)) {
        eventPagniateQuery.andWhere('company.id = :companyId', { companyId: ctx.user.companyId })
      }

      if (req.query.search && req.query.search !== '') {
        eventPagniateQuery.andWhere('event.name ILIKE :search', { search: `%${search}%` })
      }

      if (withDeleted) {
        eventPagniateQuery.withDeleted()
      }

      if (andWhere.length > 0) {
        for (const { key, params } of andWhere) {
          eventPagniateQuery.andWhere(key, params)
        }
      }

      if (orWhere.length > 0) {
        for (const { key, params } of orWhere) {
          eventPagniateQuery.andWhere(key, params)
        }
      }

      const [events, total] = await eventPagniateQuery.getManyAndCount()

      return res.status(200).json({
        data: events,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
      })
    })
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public getAllPeriod = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }
      const { start, end } = req.query

      const now = dayjs().startOf('month')

      const startDate = start ? dayjs(start.toLocaleString()).toDate() : now.toDate()

      const endDate = start ? dayjs(end.toLocaleString()).toDate() : now.endOf('month').toDate()

      let whereFields: FindOptionsWhere<EventEntity>[] = [
        { start: Between(startDate, endDate) },
        { end: Between(startDate, endDate) },
        {
          start: LessThanOrEqual(startDate),
          end: Between(startDate, endDate),
        },
        {
          start: LessThanOrEqual(startDate),
          end: MoreThanOrEqual(endDate),
        },
      ]

      if (!isUserAdmin(ctx.user)) {
        whereFields = [...whereFields].map(obj => ({
          ...obj,
          company: {
            id: ctx.user.companyId,
          },
        }))
      }
      const [events, total] = await this.repository.findAndCount({
        where: whereFields,
      })

      const answers = await this.AnswerService.getAnswersForManyEvents(events.map(event => event.id))

      return res.status(200).json({
        answers,
        events,
        calendarData: composeEventForPeriod({
          events,
          period: {
            start: startDate,
            end: endDate,
          },
        }),
        total,
      })
    })
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { event }: { event: Partial<EventEntity> } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const id = parseInt(req.params.id)
      if (id) {
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

  public synchroniseOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'identifiant de l\'événement manquant')
      }

      const { event } = await this.EventService.updateEventStatus(id)
      await defaultQueue.add(
        generateQueueName('UpdateEventStatusJob'),
        new UpdateEventStatusJob({
          eventId: id,
        }),
      )
      return res.status(200).json(event)
    })
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const id = parseInt(req.params.id)
      if (id) {
        const user = ctx.user
        const eventToDelete = await this.EventService.getOneWithoutRelations(id)

        if (!eventToDelete) {
          throw new ApiError(422, 'L\'événement n\'éxiste pas')
        }

        if (eventToDelete?.companyId === user.companyId || isUserAdmin(ctx.user)) {
          await this.EventDeleteService.softDeleteOneAndRelations(eventToDelete)
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
