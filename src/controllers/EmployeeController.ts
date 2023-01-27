import type { Request, Response } from 'express'
import type { EntityManager, FindOptionsWhere, Repository } from 'typeorm'
import Context from '../context'
import { EmployeeEntity, employeeSearchablefields } from '../entity/EmployeeEntity'
import { paginator, wrapperRequest } from '../utils'
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import EmployeeService from '../services/EmployeeService'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { generateRedisKey, generateRedisKeysArray, isUserAdmin, isUserEntity } from '../utils/index'
import { AddressService } from '../services'
import type { EmployeeCreateOneRequest } from '../types'
import { EntitiesEnum } from '../types'
import { APP_SOURCE, REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'

export default class EmployeeController {
  getManager: EntityManager
  EmployeeService: EmployeeService
  AddressService: AddressService
  AnswerService: AnswerService
  EventService: EventService
  employeeRepository: Repository<EmployeeEntity>
  redisCache: RedisCache

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.redisCache = REDIS_CACHE
  }

  private saveEmployeeRedisCache = async (employee: EmployeeEntity) => {
    await this.redisCache.save(generateRedisKey({
      typeofEntity: EntitiesEnum.EMPLOYEE,
      field: 'id',
      id: employee.id,
    }), employee)
  }

  /**
   * employee must have event id
   * @param employee employee: Partial<employeeEntity>
   * @returns return employee just created
   */
  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { employee, address }: EmployeeCreateOneRequest = req.body

      const ctx = Context.get(req)
      let userId = null

      if (isUserEntity(ctx.user) && isUserAdmin(ctx.user)) {
        userId = parseInt(req.params.id)
      } else {
        userId = ctx.user.id
      }

      const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(employee.email)

      if (isEmployeeAlreadyExist) {
        return res.status(422).json({ error: 'cet email existe déjà' })
      }

      const newEmployee = await this.EmployeeService.createOne(employee, userId)
      if (newEmployee) {
        if (address) {
          await this.AddressService.createOne({
            address,
            employeeId: newEmployee.id,
          })
        }

        const employeeToSend = await this.EmployeeService.getOne(newEmployee.id)

        await this.saveEmployeeRedisCache(employeeToSend)

        return res.status(200).json(employeeToSend)
      }
    })
  }

  public createMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { employees }: { employees: EmployeeCreateOneRequest[] } = req.body

      if (employees.length > 0) {
        const ctx = Context.get(req)
        let userId = null

        if (isUserEntity(ctx.user) && isUserAdmin(ctx.user)) {
          userId = parseInt(req.params.id)
        } else {
          userId = ctx.user.id
        }

        const newEmployees = await Promise.all(employees.map(async ({ employee, address }) => {
          const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(employee.email)

          if (!isEmployeeAlreadyExist) {
            const emp = await this.EmployeeService.createOne(employee, userId)

            if (emp) {
              await this.AddressService.createOne({ address, employeeId: emp.id })
            }

            await this.saveEmployeeRedisCache(emp)
            return this.EmployeeService.getOne(emp.id)
          }
        }))
        return res.status(200).json(newEmployees)
      }
      return res.status(400).json({ error: 'employees is empty' })
    })
  }

  public createManyEmployeeByEventId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.params.eventId)
      const { employees }: { employees: EmployeeCreateOneRequest[] } = req.body

      if (employees.length > 0) {
        const ctx = Context.get(req)
        let userId = null

        if (isUserEntity(ctx.user) && isUserAdmin(ctx.user)) {
          userId = parseInt(req.params.id)
        } else {
          userId = ctx.user.id
        }

        const newEmployees = await Promise.all(employees.map(async ({ employee, address }) => {
          const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(employee.email)

          if (!isEmployeeAlreadyExist) {
            const emp = await this.EmployeeService.createOne(employee, userId)

            if (emp) {
              await this.AddressService.createOne({ address, employeeId: emp.id })
            }

            await this.saveEmployeeRedisCache(emp)
            return this.EmployeeService.getOne(emp.id)
          }
        }))

        const newEmployeesIds = newEmployees.map(employee => employee.id)
        await this.AnswerService.createMany(eventId, newEmployeesIds)
        await this.EventService.getNumberSignatureNeededForEvent(eventId)

        const returnedEmployees = newEmployees.map(employee => ({
          ...employee,
          eventId,
          createdByUser: userId,
        }))

        return res.status(200).json(returnedEmployees)
      }
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
        const employee = await this.redisCache.get<EmployeeEntity>(
          generateRedisKey({
            field: 'id',
            typeofEntity: EntitiesEnum.EMPLOYEE,
            id,
          }),
          () => this.EmployeeService.getOne(id))

        return res.status(200).json(employee)
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string

      if (ids) {
        const employeeIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))

        if (employeeIds?.length > 0) {
          const employees = await this.redisCache.getMany<EmployeeEntity>({
            keys: generateRedisKeysArray({
              field: 'id',
              typeofEntity: EntitiesEnum.EMPLOYEE,
              ids: employeeIds,
            }),
            typeofEntity: EntitiesEnum.EMPLOYEE,
            fetcher: () => this.EmployeeService.getMany(employeeIds),
          })

          return res.status(200).json(employees)
        }
      }
      return res.status(422).json({ error: 'Missing ids' })
    })
  }

  /**
   * @param id user id
   * @returns all employees from user Id
   */
  public getManyByUserId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const userId = parseInt(req.params.id)
      if (userId) {
        const employees = await this.EmployeeService.getAllForUser(userId)

        return res.status(200).json(employees)
      }
      return res.status(422).json({ error: 'identifiant de l\'utilisateur manquant' })
    })
  }

  /**
   * @param id event id
   * @returns all employees from event Id
   */
  public getManyByEventId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.params.id)
      if (eventId) {
        const answers = await this.AnswerService.getAllAnswersForEvent(eventId, true)
        const employees = answers.map(answer => answer.employee)
        return res.status(200).json(employees)
      }
      return res.status(422).json({ error: 'identifiant de l\'événement manquant' })
    })
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, employeeSearchablefields)

      const [employees, count] = await this.employeeRepository.findAndCount({
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<EmployeeEntity>,
        },
      })

      return res.status(200).json({
        data: employees,
        currentPage: queriesFilters.page,
        limit: queriesFilters.take,
        total: count,
      })
    })
  }

  /**
   * @param employee employee: Partial<EmployeeEntity>
   * @returns return employee just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { employee }: { employee: Partial<EmployeeEntity> } = req.body
      const id = parseInt(req.params.id)

      if (id) {
        const employeeUpdated = await this.EmployeeService.updateOne(id, employee)
        await this.saveEmployeeRedisCache(employeeUpdated)

        return res.status(200).json(employeeUpdated)
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
    })
  }

  public patchOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const event = await this.EventService.getNumberSignatureNeededForEvent(id)

        return res.status(200).json(event)
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const ctx = Context.get(req)
        const userId = ctx.user.id

        const getEmployee = await this.EmployeeService.getOne(id)

        if (getEmployee.createdByUserId === userId || checkUserRole(Role.ADMIN)) {
          await this.EmployeeService.deleteOne(id)

          await this.redisCache.invalidate(generateRedisKey({
            typeofEntity: EntitiesEnum.EMPLOYEE,
            field: 'id',
            id,
          }))

          return res.status(204).json(getEmployee)
        }
        return res.status(401).json('Unauthorized')
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
    })
  }
}
