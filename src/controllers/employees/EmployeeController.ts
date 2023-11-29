import type { NextFunction, Request, Response } from 'express'
import type { FindOptionsWhere, Repository } from 'typeorm'
import csv from 'csvtojson'
import { EmployeeEntity, employeeRelationFields, employeeSearchablefields } from '../../entity/employees/EmployeeEntity'
import { wrapperRequest } from '../../utils'
import EmployeeService from '../../services/employee/EmployeeService'
import AnswerService from '../../services/AnswerService'
import EventService from '../../services/EventService'
import { generateRedisKey, generateRedisKeysArray, isUserAdmin, isUserEntity, parseQueryIds } from '../../utils/index'
import { AddressService } from '../../services'
import type { EmployeeCreateOneRequest, UploadCSVEmployee } from '../../types'
import { EntitiesEnum, NotificationTypeEnum } from '../../types'
import { APP_SOURCE, REDIS_CACHE } from '../..'
import type RedisCache from '../../RedisCache'
import { ApiError } from '../../middlewares/ApiError'
import RedisService from '../../services/RedisService'
import { defaultQueue } from '../../jobs/queue/queue'
import { generateQueueName } from '../../jobs/queue/jobs/provider'
import { CreateEmployeeNotificationsJob } from '../../jobs/queue/jobs/createEmployeeNotifications.job'
import { newPaginator } from '../../utils/paginatorHelper'
import { CompanyEntity } from '../../entity/Company.entity'
import { GroupService } from '../../services/employee/GroupService'

export default class EmployeeController {
  private EmployeeService: EmployeeService
  private AddressService: AddressService
  private AnswerService: AnswerService
  private EventService: EventService
  private GroupService: GroupService
  private employeeRepository: Repository<EmployeeEntity>
  private companyRepository: Repository<CompanyEntity>
  private redisCache: RedisCache
  private RediceService: RedisService

  constructor() {
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.GroupService = new GroupService(APP_SOURCE)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.companyRepository = APP_SOURCE.getRepository(CompanyEntity)
    this.redisCache = REDIS_CACHE
    this.RediceService = new RedisService(APP_SOURCE)
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
  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { employee, address }: EmployeeCreateOneRequest = req.body

      let userId = null

      if (!ctx && !ctx.user) {
        throw new ApiError(401, 'Vous n\'êtes pas authentifié')
      }

      userId = ctx.user.id

      const isEmployeeAlreadyExist = await this.employeeRepository.exist({
        where: {
          email: employee.email,
        },
      })

      if (isEmployeeAlreadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      const newEmployee = await this.EmployeeService.createOne(employee, ctx.user.companyId)

      if (newEmployee) {
        await defaultQueue.add(
          generateQueueName(NotificationTypeEnum.EMPLOYEE_CREATED),
          new CreateEmployeeNotificationsJob({
            type: NotificationTypeEnum.EMPLOYEE_CREATED,
            employees: [newEmployee],
            userId,
          }))

        if (address) {
          await this.AddressService.createOne({
            address,
            employeeId: newEmployee.id,
          })
        }

        const employeeToSend = await this.EmployeeService.getOne(newEmployee.id)

        await Promise.all([
          this.RediceService.updateCurrentUserInCache({ userId }),
          this.saveEmployeeRedisCache(employeeToSend),
        ])

        return res.status(200).json(employeeToSend)
      }
    })
  }

  public createMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { employees }: { employees: EmployeeCreateOneRequest[] } = req.body

      if (employees.length > 0) {
        let userId = null

        if (!ctx) {
          throw new ApiError(500, 'Une erreur s\'est produite')
        }
        userId = ctx.user.id

        const newEmployees = await Promise.all(employees.map(async ({ employee, address }) => {
          const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(employee.email)

          if (!isEmployeeAlreadyExist) {
            const emp = await this.EmployeeService.createOne(employee, userId)

            if (emp) {
              await this.AddressService.createOne({ address, employeeId: emp.id })
            }
            await this.RediceService.updateCurrentUserInCache({ userId })

            await this.saveEmployeeRedisCache(emp)
            return this.EmployeeService.getOne(emp.id)
          }
        }))
        await defaultQueue.add(
          generateQueueName(NotificationTypeEnum.EMPLOYEE_CREATED),
          new CreateEmployeeNotificationsJob({
            type: NotificationTypeEnum.EMPLOYEE_CREATED,
            employees: newEmployees,
            userId,
          }))

        return res.status(200).json(newEmployees)
      }
      throw new ApiError(422, 'Destinataires manquant')
    })
  }

  public createManyEmployeeByEventId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const eventId = parseInt(req.params.eventId)
      const { employees }: { employees: EmployeeCreateOneRequest[] } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (employees.length > 0) {
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

            await this.RediceService.updateCurrentUserInCache({ userId })
            await this.saveEmployeeRedisCache(emp)
            return this.EmployeeService.getOne(emp.id)
          }
        }))

        await defaultQueue.add(
          generateQueueName(NotificationTypeEnum.EMPLOYEE_CREATED),
          new CreateEmployeeNotificationsJob({
            type: NotificationTypeEnum.EMPLOYEE_CREATED,
            employees: newEmployees,
            userId,
          }))

        const newEmployeesIds = newEmployees.map(employee => employee.id)

        await this.AnswerService.createMany(eventId, newEmployeesIds)
        await this.EventService.updateEventStatus(eventId)

        return res.status(200).json(newEmployees)
      }
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const ids = req.query.ids as string

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (ids) {
        const employeeIds = parseQueryIds(ids)

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
      throw new ApiError(422, 'identifiants des destinataires manquants')
    })
  }

  /**
   * @param id user id
   * @returns all employees from user Id
   */
  public getManyByUserId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const userId = parseInt(req.params.id)
      if (userId) {
        const employees = await this.EmployeeService.getAllForUser(userId)

        return res.status(200).json(employees)
      }

      throw new ApiError(422, 'identifiant de l\'utilisateur manquant')
    })
  }

  /**
   * @param id event id
   * @returns all employees from event Id
   */
  public getManyByEventId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const eventId = parseInt(req.params.id)
      if (eventId) {
        const answers = await this.AnswerService.getAllAnswersForEvent(eventId, true)
        const employees = answers.map(answer => answer.employee)
        return res.status(200).json(employees)
      }
      throw new ApiError(422, 'identifiant de l\'événement manquant')
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

      const { where, page, take, skip, order, withDeleted } = newPaginator<EmployeeEntity>({
        req,
        searchableFields: employeeSearchablefields,
        relationFields: employeeRelationFields,
      })

      let whereFields = where

      if (!isUserAdmin(ctx.user)) {
        if (where.length > 0) {
          whereFields = where.map(obj => {
            obj.company = {
              ...obj.company as FindOptionsWhere<CompanyEntity>,
              id: ctx.user.companyId,
            }
            return obj
          })
        } else {
          whereFields.push({
            company: {
              id: ctx.user.companyId,
            },
          })
        }
      }

      const [employees, total] = await this.employeeRepository.findAndCount({
        take,
        skip,
        where: whereFields,
        order,
        withDeleted: withDeleted || isUserAdmin(ctx.user), // TODO remove This by default front should send what's he want to see
      })

      return res.status(200).json({
        data: employees,
        currentPage: page,
        limit: take,
        totalPages: Math.ceil(total / take),
        total,
        order,
      })
    })
  }

  /**
   * @param employee employee: Partial<EmployeeEntity>
   * @returns return employee just updated
   */
  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { employee }: { employee: Partial<EmployeeEntity> } = req.body
      const id = parseInt(req.params.id)

      if (id) {
        const employeeUpdated = await this.EmployeeService.updateOne(id, employee)
        await this.saveEmployeeRedisCache(employeeUpdated)

        return res.status(200).json(employeeUpdated)
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public patchOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        await this.EventService.updateEventStatus(id)

        const event = await this.EventService.getOneWithoutRelations(id)

        return res.status(200).json(event)
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (!id) {
        throw new ApiError(422, 'identifiant du destinataire manquant')
      }

      if (!ctx?.user) {
        throw new ApiError(401, 'Action non autorisée vous n\'êtes pas authentifié')
      }

      const userId = ctx.user.id

      const getEmployee = await this.EmployeeService.getOne(id)

      if (!getEmployee) {
        throw new ApiError(422, 'destinataire manquant')
      }

      if (getEmployee.companyId !== ctx.user.companyId && !isUserAdmin(ctx.user)) {
        throw new ApiError(401, 'Action non autorisée')
      }

      await this.GroupService.removeEmployeesOnGroup([getEmployee])
      await this.EmployeeService.deleteOne(id)

      const [company] = await Promise.all([
        this.companyRepository.findOne({
          where: {
            id: getEmployee.companyId,
          },
          relations: {
            groups: true,
          },
        }),
        this.redisCache.invalidate(generateRedisKey({
          typeofEntity: EntitiesEnum.EMPLOYEE,
          field: 'id',
          id,
        })),
        this.RediceService.updateCurrentUserInCache({ userId }),
      ])

      const groups = company.groups
      delete company.groups

      return res.status(200).json({
        employee: getEmployee,
        company,
        groups,
      })
    })
  }

  public uploadFormCSV = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const fileRecieved = req.file

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const userId = ctx.user?.id

      if (fileRecieved && userId) {
        const newEmployeesData: UploadCSVEmployee[] = await csv().fromFile(fileRecieved.path)

        const newEmployees = await Promise.all(newEmployeesData.map(async ({
          firstName,
          lastName,
          addressLine,
          postalCode,
          city,
          country,
          email,
          phone,
        }) => {
          const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(email)

          if (!isEmployeeAlreadyExist) {
            const emp = await this.EmployeeService.createOne({
              firstName,
              lastName,
              email,
              phone,
            }, userId)

            if (emp) {
              await this.AddressService.createOne({
                address: {
                  addressLine,
                  postalCode,
                  city,
                  country,
                },
                employeeId: emp.id,
              })
            }
            await this.RediceService.updateCurrentUserInCache({ userId })

            await this.saveEmployeeRedisCache(emp)
            return this.EmployeeService.getOne(emp.id)
          }
        }))
        return res.status(200).json(newEmployees)
      }
      throw new ApiError(422, 'Destinataires manquant')
    })
  }

  public restoreOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const id = parseInt(req.params.id)
      if (!id) {
        throw new ApiError(422, 'Paramètre manquant')
      }

      const deletedEmployee = await this.employeeRepository.findOne({
        where: {
          id,
        },
        withDeleted: true,
      })

      const currentUser = ctx.user
      if (!currentUser || (currentUser.companyId !== deletedEmployee.companyId && !isUserAdmin(currentUser))) {
        throw new ApiError(401, 'Action non authorisée')
      }

      await this.employeeRepository.restore(id)
      const employee = await this.employeeRepository.findOne({
        where: {
          id,
        },
      })
      return res.status(200).json(employee)
    })
  }
}
