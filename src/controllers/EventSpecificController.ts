import type { NextFunction, Request, Response } from 'express'
import type { DataSource } from 'typeorm'
import type RedisCache from '../RedisCache'
import { REDIS_CACHE } from '..'
import type EventEntity from '../entity/EventEntity'
import EventService from '../services/EventService'
import { AddressService } from '../services'
import AnswerService from '../services/AnswerService'
import { wrapperRequest } from '../utils'
import type { EventWithRelationsCreationPayload } from '../types'
import { EntitiesEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import EmployeeService from '../services/employee/EmployeeService'
import type { AddressEntity } from '../entity/AddressEntity'
import { ApiError } from '../middlewares/ApiError'
import { isUserAdmin } from '../utils/userHelper'
import { EventCreateService } from '../services/event/eventCreateService.service'

export default class EventSpecificController {
  private EmployeeService: EmployeeService
  private EventService: EventService
  private redisCache: RedisCache
  private AddressService: AddressService
  private AnswerService: AnswerService
  private EventCreateService: EventCreateService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.EmployeeService = new EmployeeService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.AddressService = new AddressService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
      this.EventCreateService = new EventCreateService(DATA_SOURCE)
    }
  }

  public fetchOneEventWithRelations = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const eventId = parseInt(req.params.id)
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

          const [address, answers] = await Promise.all([
            this.redisCache.get<AddressEntity>(
              generateRedisKey({
                field: 'id',
                typeofEntity: EntitiesEnum.ADDRESS,
                id: event.addressId,
              }),
              () => this.AddressService.getOne(event.addressId)),

            this.AnswerService.getAllAnswersForEvent(eventId),
          ])

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

  public posteOneWithRelations = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const {
        event: eventPayload,
        address: addressPayload,
        photographerId,
      }: EventWithRelationsCreationPayload = req.body

      if (!ctx || !ctx.user || !ctx.user.companyId) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const companyId = ctx.user.companyId

      if (!eventPayload || !companyId) {
        throw new ApiError(422, 'Formulaire incomplet')
      }

      const { event, address, answers } = await this.EventCreateService.createEventWithRelations({
        event: eventPayload,
        address: addressPayload,
        companyId,
        photographerId,
        user: ctx.user,
      })

      return res.status(200).json({
        event,
        answers,
        address,
      })
    })
  }
}
