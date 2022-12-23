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
import type { UserEntity } from '../entity/UserEntity'
import { isArrayOfNumbers, isUserAdmin, isUserEntity } from '../utils/index'
import { AddressService } from '../services'
import type { EmployeeCreateOneRequest } from '../types'
import { APP_SOURCE } from '..'

export default class EmployeeController {
  getManager: EntityManager
  EmployeeService: EmployeeService
  AddressService: AddressService
  AnswerService: AnswerService
  EventService: EventService
  employeeRepository: Repository<EmployeeEntity>

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
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
        return res.status(200).json({ ...employeeToSend, createdByUser: userId })
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
        const employee = await this.EmployeeService.getOne(id)
        return res.status(200).json(employee)
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
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
        const entitiesReturned = employees.map(employee => ({
          ...employee,
          createdByUser: userId,
        }))
        return res.status(200).json(entitiesReturned)
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
        const user = await this.EventService.getOneEvent(eventId)
        const answers = await this.AnswerService.getAllAnswersForEvent(eventId)
        const employeesWithAnswers = answers.map(answer => {
          const employee = {
            ...answer.employee as unknown as EmployeeEntity,
            answer,
            event: eventId,
            createdByUser: user.id,
          }
          delete employee.answer.employee
          return employee
        })
        return res.status(200).json({ data: employeesWithAnswers })
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
      const employeeFilters = {
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<EmployeeEntity>,
        },
        relations: ['createdByUser', 'answers', 'address'],
      }
      const employees = await this.employeeRepository.find(employeeFilters)
      const entityReturned = employees.map(employee => {
        const user = employee.createdByUser as UserEntity
        return {
          ...employee,
          event: employee.answers.map(answer => answer.event).filter(id => id),
          createdByUser: user?.id,
        }
      })

      const total = await this.employeeRepository.countBy(queriesFilters as FindOptionsWhere<EmployeeEntity>)
      return res.status(200).json({ data: entityReturned, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
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
        const employeeUser = getEmployee.createdByUser as unknown as UserEntity
        if (employeeUser.id === userId || checkUserRole(Role.ADMIN)) {
          await this.EmployeeService.deleteOne(id)
          if (employeeUser.events && employeeUser.events.length && isArrayOfNumbers(employeeUser.events)) {
            employeeUser.events.forEach(async eventId => {
              await this.EventService.getNumberSignatureNeededForEvent(eventId)
            })
          }
          return res.status(204).json(getEmployee)
        }
        return res.status(401).json('Unauthorized')
      }
      return res.status(422).json({ error: 'identifiant du destinataire manquant' })
    })
  }
}
