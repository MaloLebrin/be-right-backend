import { Request, Response } from "express"
import { getManager } from "typeorm"
import Context from "../context"
import { EmployeeEntity, employeeSearchablefields } from "../entity/EmployeeEntity"
import { paginator } from "../utils"
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import EmployeeService from '../services/EmployeeService'
import AnswerService from "../services/AnswerService"
import EventService from '../services/EventService'
import { UserEntity } from "../entity/UserEntity"
import { isArrayOfNumbers, isUserAdmin, isUserEntity } from "../utils/index"
import { AddressService } from "../services"
import { EmployeeCreateOneRequest } from "../types"

export default class EmployeeController {

  /**
   * employee must have event id
   * @param employee employee: Partial<employeeEntity>
   * @returns return employee just created
   */
  public static createOne = async (req: Request, res: Response) => {
    try {
      const { employee, address }: EmployeeCreateOneRequest = req.body
      const ctx = Context.get(req)
      let userId = null
      if (isUserEntity(ctx.user) && isUserAdmin(ctx.user)) {
        userId = parseInt(req.params.id)
      } else {
        userId = ctx.user.id
      }
      const isEmployeeAlreadyExist = await EmployeeService.isEmployeeAlreadyExist(employee.email)
      if (isEmployeeAlreadyExist) {
        return res.status(422).json({ error: 'cet email existe déjà' })
      }
      const newEmployee = await EmployeeService.createOne(employee, userId)
      if (newEmployee) {
        if (address) {
          await AddressService.createOne({
            address,
            employeeId: newEmployee.id
          })
        }
        const employeeToSend = await EmployeeService.getOne(newEmployee.id)
        return res.status(200).json({ ...employeeToSend, createdByUser: userId })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static createMany = async (req: Request, res: Response) => {
    try {
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
          const isEmployeeAlreadyExist = await EmployeeService.isEmployeeAlreadyExist(employee.email)
          if (!isEmployeeAlreadyExist) {
            const emp = await EmployeeService.createOne(employee, userId)
            if (emp) {
              await AddressService.createOne({ address, employeeId: emp.id })
            }
            return EmployeeService.getOne(emp.id)
          }
        }))
        return res.status(200).json(newEmployees)
      } else {
        return res.status(400).json({ error: "employees is empty" })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  public static createManyEmployeeByEventId = async (req: Request, res: Response) => {
    try {
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
          const isEmployeeAlreadyExist = await EmployeeService.isEmployeeAlreadyExist(employee.email)
          if (!isEmployeeAlreadyExist) {
            const emp = await EmployeeService.createOne(employee, userId)
            if (emp) {
              await AddressService.createOne({ address, employeeId: emp.id })
            }
            return EmployeeService.getOne(emp.id)
          }
        }))
        const newEmployeesIds = newEmployees.map(employee => employee.id)
        await AnswerService.createMany(eventId, newEmployeesIds)
        await EventService.getNumberSignatureNeededForEvent(eventId)
        const returnedEmployees = newEmployees.map(employee => ({
          ...employee,
          eventId,
          createdByUser: userId,
        }))

        return res.status(200).json(returnedEmployees)
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public static getOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const employee = await EmployeeService.getOne(id)
        return res.status(200).json(employee)
      }
      return res.status(422).json({ error: "identifiant du destinataire manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }


  /**
   * @param id user id
   * @returns all employees from user Id
   */
  public static getManyByUserId = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id)
      if (userId) {
        const employees = await EmployeeService.getAllForUser(userId)
        const entitiesReturned = employees.map(employee => ({
          ...employee,
          createdByUser: userId,
        }))
        return res.status(200).json(entitiesReturned)
      }
      return res.status(422).json({ error: "identifiant de l\'utilisateur manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  /**
   * @param id event id
   * @returns all employees from event Id
   */
  public static getManyByEventId = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id)
      if (eventId) {
        const user = await EventService.getOneEvent(eventId)
        const answers = await AnswerService.getAllAnswersForEvent(eventId)
        const employeesWithAnswers = answers.map(answer => {
          const employee = {
            ...answer.employee as unknown as EmployeeEntity,
            answer: answer,
            event: eventId,
            createdByUser: user.id,
          }
          delete employee.answer.employee
          return employee
        })
        return res.status(200).json({ data: employeesWithAnswers })
      }
      return res.status(422).json({ error: "identifiant de l'événement manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public static getAll = async (req: Request, res: Response) => {
    try {
      const queriesFilters = paginator(req, employeeSearchablefields)
      const employeeFilters = {
        ...queriesFilters,
        relations: ["createdByUser", "answers"],
      }
      const employees = await getManager().find(EmployeeEntity, employeeFilters)

      const entityReturned = employees.map(employee => {
        const user = employee.createdByUser as UserEntity
        return {
          ...employee,
          event: employee.answers.map(answer => answer.event),
          createdByUser: user?.id,
        }
      })

      const total = await getManager().count(EmployeeEntity, queriesFilters)
      return res.status(200).json({ data: entityReturned, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  /**
   * @param employee employee: Partial<EmployeeEntity>
   * @returns return employee just updated
   */
  public static updateOne = async (req: Request, res: Response) => {
    try {
      const { employee }: { employee: Partial<EmployeeEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const employeeUpdated = await EmployeeService.updateOne(id, employee)
        return res.status(200).json(employeeUpdated)
      }
      return res.status(422).json({ error: "identifiant du destinataire manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  public static patchOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const event = await EventService.getNumberSignatureNeededForEvent(id)
        return res.status(200).json(event)
      }
      return res.status(422).json({ error: "identifiant du destinataire manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        const userId = ctx.user.id
        const getEmployee = await getManager().findOne(EmployeeEntity, id, { relations: ["createdByUser"] })
        const employeeUser = getEmployee.createdByUser as UserEntity
        if (employeeUser.id === userId || checkUserRole(Role.ADMIN)) {
          await EmployeeService.deleteOne(id)
          if (employeeUser.events && employeeUser.events.length && isArrayOfNumbers(employeeUser.events)) {
            employeeUser.events.forEach(async (eventId) => {
              await EventService.getNumberSignatureNeededForEvent(eventId)
            })
          }
          return res.status(204).json(getEmployee)
        } else {
          return res.status(401).json('Unauthorized')
        }
      }
      return res.status(422).json({ error: "identifiant du destinataire manquant" })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })

    }
  }

  // public static deleteMany = async (req: Request, res: Response) => {
  // 	try {
  // 		const employeeIds: number[] = req.body.employeeIds
  // 		const ctx = Context.get(req)
  // 		const userId = ctx.user.id
  // 		if (employeeIds.every(async (id) => {
  // 			const employee = await EmployeeService.getOne(id)
  // 			return employee.createdByUser === userId || checkUserRole(Role.ADMIN)
  // 		})) {
  // 			const deletedEmployees = await EmployeeService.deleteMany(employeeIds)
  // 			return res.status(204).json({ data: deletedEmployees, message: 'Employees deleted' })
  // 		} else {
  // 			return res.status(401).json('Unauthorized')
  // 		}
  // 	} catch (error) {
  // 		console.error(error)
  // 		if (error.status) {
  // 			return res.status(error.status || 500).json({ error: error.message })
  // 		}
  // 		return res.status(400).json({ error: error.message })

  // 	}
  // }
}
