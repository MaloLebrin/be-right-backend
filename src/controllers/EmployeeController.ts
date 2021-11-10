import { Request, Response } from "express"
import { getManager } from "typeorm"
import Context from "../context"
import { EmployeeEntity, employeeSearchablefields } from "../entity/EmployeeEntity"
import { paginator } from "../utils"
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import EventEntity from '../entity/EventEntity'

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
			const employeeToCreate = {
				...employee,
				user: userId,
			}
			const newEmployee = getManager().create(EmployeeEntity, employeeToCreate)
			if (employee.events) {
				const id: number = parseInt(employee.events.toString())
				const event = await getManager().findOne(EventEntity, id)
				event.employees = [newEmployee]
				await getManager().save([newEmployee, event])
				return res.status(200).json(newEmployee)
			}
			await getManager().save([newEmployee])
			return res.status(200).json(newEmployee)
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
	 * @param id user id
	 * @returns all employees from user Id
	 */
	public static getManyByUserId = async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.id)
			const employees = await getManager().find(EmployeeEntity, { user: userId })
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
			const employees = await getManager().findOne(EmployeeEntity, { relations: ["events"] })
			return res.status(200).json({ data: employees })
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
			const { ids }: { ids: number[] } = req.body
			const employees = await Promise.all(ids.map(id => getManager().findOne(EmployeeEntity, id, { relations: ["events"] })))
			return res.status(200).json({ data: employees, total: employees.length })
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
			const employeeFinded = await getManager().findOne(EmployeeEntity, id)
			const employeeUpdated = {
				...employeeFinded,
				...employee,
				updatedAt: new Date(),
			}
			await getManager().save(employeeUpdated)
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
			if (employeeToDelete.user === userId || checkUserRole(Role.ADMIN)) {
				await getManager().delete(EmployeeEntity, id)
				return res.status(204).json({ data: employeeToDelete, message: 'Employee deleted' })
			} else {
				return res.status(401).json('Unauthorized')
			}
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}
}
