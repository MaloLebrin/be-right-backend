import { Request, Response } from "express"
import { getManager } from "typeorm"
import Context from "../context"
import { EmployeeEntity, employeeSearchablefields } from "../entity/EmployeeEntity"
import { paginator } from "../utils"
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import EmployeeService from '../services/EmployeeService'
import AnswerService from "../services/AnswerService"

export default class EmployeeController {

	/**
	 * employee must have event id
	 * @param employee employee: Partial<employeeEntity>
	 * @returns return employee just created
	 */
	public static createOne = async (req: Request, res: Response) => {
		try {
			const { employee }: { employee: Partial<EmployeeEntity> } = req.body
			const ctx = Context.get(req)
			const userId = ctx.user.id
			const newEmployee = await EmployeeService.createOne(employee, userId)
			return res.status(200).json(newEmployee)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static createMany = async (req: Request, res: Response) => {
		try {
			const { employees }: { employees: Partial<EmployeeEntity>[] } = req.body
			if (employees.length > 0) {
				const ctx = Context.get(req)
				const userId = ctx.user.id
				const newEmployees = await Promise.all(employees.map(employee => EmployeeService.createOne(employee, userId)))
				return res.status(200).json(newEmployees)
			} else {
				return res.status(400).json({ error: "employees is empty" })
			}
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static createManyEmployeeByEventId = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.eventId)
			const { employees }: { employees: Partial<EmployeeEntity>[] } = req.body
			if (employees.length > 0) {
				const ctx = Context.get(req)
				const userId = ctx.user.id
				const newEmployees = await Promise.all(employees.map(employee => EmployeeService.createOne(employee, userId)))
				const newEmployeesIds = newEmployees.map(employee => employee.id)
				await AnswerService.createMany(eventId, newEmployeesIds)
				const returnedEmployees = newEmployees.map(employee => ({
					...employee,
					eventId,
				}))

				return res.status(200).json(returnedEmployees)
			}
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param Id number
	 * @returns entity form given id
	 */
	public static getOne = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const employee = await getManager().findOne(EmployeeEntity, id)
			return res.status(200).json(employee)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param ids Array of ids
	 * @returns each employee
	 */
	public static getMany = async (req: Request, res: Response) => {
		try {
			const ids: number[] = req.body.employeeIds
			const employees = await EmployeeService.getMany(ids)
			return employees ? res.status(200).json(employees) : res.status(404).json({ error: "employees not found" })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param id user id
	 * @returns all employees from user Id
	 */
	public static getManyByUserId = async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.id)
			const employees = await EmployeeService.getAllForUser(userId)
			return res.status(200).json({ data: employees, count: employees.length })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * @param id event id
	 * @returns all employees from event Id
	 */
	public static getManyByEventId = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.id)
			const answers = await AnswerService.getAllAnswersForEvent(eventId)
			const employeesIds = answers.map(answer => answer.employee)
			const employees = await EmployeeService.getMany(employeesIds)
			const employeesWithAnswers = employees.map(employee => ({
				...employee,
				answers: answers.filter(answer => answer.employee === employee.id),
			}))
			return res.status(200).json({ data: employeesWithAnswers })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	/**
	 * paginate function
	 * @returns paginate response
	 */
	public static getAll = async (req: Request, res: Response) => {
		try {
			const queriesFilters = paginator(req, employeeSearchablefields)
			const employees = await getManager().find(EmployeeEntity, queriesFilters)
			const total = await getManager().count(EmployeeEntity, queriesFilters)
			return res.status(200).json({ data: employees, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
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
			const employeeUpdated = await EmployeeService.updateOne(id, employee)
			return res.status(200).json(employeeUpdated)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static deleteOne = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const ctx = Context.get(req)
			const userId = ctx.user.id
			const employeeToDelete = await getManager().findOne(EmployeeEntity, id)
			if (employeeToDelete.createdByUser === userId || checkUserRole(Role.ADMIN)) {
				await EmployeeService.deleteOne(id)
				return res.status(204).json({ data: employeeToDelete, message: 'Employee deleted' })
			} else {
				return res.status(401).json('Unauthorized')
			}
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static deleteMany = async (req: Request, res: Response) => {
		try {
			const employeeIds: number[] = req.body.employeeIds
			const ctx = Context.get(req)
			const userId = ctx.user.id
			if (employeeIds.every(async (id) => {
				const employee = await EmployeeService.getOne(id)
				return employee.createdByUser === userId || checkUserRole(Role.ADMIN)
			})) {
				const deletedEmployees = await EmployeeService.deleteMany(employeeIds)
				return res.status(204).json({ data: deletedEmployees, message: 'Employees deleted' })
			} else {
				return res.status(401).json('Unauthorized')
			}
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}
}
