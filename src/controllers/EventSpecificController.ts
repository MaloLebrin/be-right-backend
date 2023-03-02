import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import type RedisCache from '../RedisCache'
import { APP_SOURCE, REDIS_CACHE } from '..'
import EventEntity from '../entity/EventEntity'
import EventService from '../services/EventService'
import { AddressService } from '../services'
import AnswerService from '../services/AnswerService'
import { wrapperRequest } from '../utils'
import { EntitiesEnum, Role } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import Context from '../context'
import { checkUserRole } from '../middlewares'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import EmployeeService from '../services/employee/EmployeeService'
import type { AddressEntity } from '../entity/AddressEntity'
import { ApiError } from '../middlewares/ApiError'

export default class EventSpecificController {
  EmployeeService: EmployeeService
  EventService: EventService
  repository: Repository<EventEntity>
  redisCache: RedisCache
  AddressService: AddressService
  AnswerService: AnswerService

  constructor() {
    // this.getManager = APP_SOURCE.manager
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(EventEntity)
    this.redisCache = REDIS_CACHE
  }

  public fetchOneEventWithRelations = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.params.id)
      const ctx = Context.get(req)
      const userId = ctx.user.id

      if (eventId && userId) {
        const event = await this.redisCache.get<EventEntity>(
          generateRedisKey({
            field: 'id',
            typeofEntity: EntitiesEnum.EVENT,
            id: eventId,
          }),
          () => this.EventService.getOneWithoutRelations(eventId))

        if (event && (checkUserRole(Role.ADMIN) || event.createdByUserId === userId)) {
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
}
