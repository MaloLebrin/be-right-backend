import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import type RedisCache from '../RedisCache'
import { APP_SOURCE, REDIS_CACHE } from '..'
import EventEntity from '../entity/EventEntity'
import EventService from '../services/EventService'
import { AddressService } from '../services'
import AnswerService from '../services/AnswerService'
import { wrapperRequest } from '../utils'
import type { EventWithRelationsCreationPayload } from '../types'
import { EntitiesEnum, NotificationTypeEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import Context from '../context'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import EmployeeService from '../services/employee/EmployeeService'
import type { AddressEntity } from '../entity/AddressEntity'
import { ApiError } from '../middlewares/ApiError'
import { defaultQueue } from '../jobs/queue/queue'
import { generateQueueName } from '../jobs/queue/jobs/provider'
import { CreateEventNotificationsJob } from '../jobs/queue/jobs/createNotifications.job'
import RedisService from '../services/RedisService'
import { SendMailAnswerCreationjob } from '../jobs/queue/jobs/sendMailAnswerCreation.job'
import { UpdateEventStatusJob } from '../jobs/queue/jobs/updateEventStatus.job'
import { isUserAdmin } from '../utils/userHelper'

export default class EventSpecificController {
  EmployeeService: EmployeeService
  EventService: EventService
  repository: Repository<EventEntity>
  redisCache: RedisCache
  AddressService: AddressService
  AnswerService: AnswerService
  RediceService: RedisService

  constructor() {
    // this.getManager = APP_SOURCE.manager
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(EventEntity)
    this.redisCache = REDIS_CACHE
    this.RediceService = new RedisService(APP_SOURCE)
  }

  private saveEventRedisCache = async (event: EventEntity) => {
    await this.redisCache.save(generateRedisKey({
      typeofEntity: EntitiesEnum.EVENT,
      field: 'id',
      id: event.id,
    }), event)
  }

  public fetchOneEventWithRelations = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.params.id)
      const ctx = Context.get(req)

      if (eventId && ctx.user.companyId) {
        const event = await this.redisCache.get<EventEntity>(
          generateRedisKey({
            field: 'id',
            typeofEntity: EntitiesEnum.EVENT,
            id: eventId,
          }),
          () => this.EventService.getOneWithoutRelations(eventId))

        if (event && (isUserAdmin(ctx.user) || event.companyId === ctx.user.companyId)) {
          let employees = []

          const address = await this.redisCache.get<AddressEntity>(
            generateRedisKey({
              field: 'id',
              typeofEntity: EntitiesEnum.ADDRESS,
              id: event.addressId,
            }),
            () => this.AddressService.getOne(event.addressId))

          const answers = await this.AnswerService.getAllAnswersForEvent(eventId)

          if (answers && answers.length > 0) {
            const employeesIds = answers.map(an => an.employeeId)

            if (employeesIds?.length > 0) {
              employees = await this.redisCache.getMany<EmployeeEntity>({
                keys: generateRedisKeysArray({
                  field: 'id',
                  typeofEntity: EntitiesEnum.EMPLOYEE,
                  ids: employeesIds,
                }),
                typeofEntity: EntitiesEnum.EMPLOYEE,
                fetcher: () => this.EmployeeService.getMany(employeesIds),
              })
            }
          }

          return res.status(200).json({
            event,
            address,
            employees,
            answers,
          })
        }

        throw new ApiError(401, 'Action non autorisée')
      }
    })
  }

  public posteOneWithRelations = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { event, address, photographerId }: EventWithRelationsCreationPayload = req.body

      const ctx = Context.get(req)
      const companyId = ctx.user.companyId
      const userId = ctx.user.id

      if (event && companyId) {
        const newEvent = await this.EventService.createOneEvent(event, companyId, photographerId)

        console.log(newEvent, '<==== newEvent')

        if (newEvent && address) {
          await defaultQueue.add(
            generateQueueName(NotificationTypeEnum.EVENT_CREATED),
            new CreateEventNotificationsJob({
              type: NotificationTypeEnum.EVENT_CREATED,
              event: newEvent,
              userId,
            }))

          const addressCreated = await this.AddressService.createOne({
            address,
            eventId: newEvent.id,
          })

          const answers = await this.AnswerService.createMany(newEvent.id, event.employeeIds)

          if (answers.length > 0) {
            const name = Date.now().toString()
            await defaultQueue.add(name, new SendMailAnswerCreationjob({
              answers,
              user: ctx.user,
              event: newEvent,
            }))
          }

          const name = Date.now().toString()
          await defaultQueue.add(name, new UpdateEventStatusJob({
            eventId: newEvent.id,
          }))

          await this.RediceService.updateCurrentUserInCache({ userId })

          await this.saveEventRedisCache(newEvent)

          return res.status(200).json({
            event: newEvent,
            answers,
            address: addressCreated,
          })
        }
        throw new ApiError(422, 'Événement non créé')
      }

      throw new ApiError(422, 'Formulaire incomplet')
    })
  }
}
