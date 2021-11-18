import { EmployeeEntity } from "../entity/EmployeeEntity"
import { getManager } from "typeorm"

export default class EmployeeService {

	public static async createOne(employee: Partial<EmployeeEntity>, userId?: number) {
		if (userId) {
			employee.createdByUser = userId
		}
		const newEmployee = getManager().create(EmployeeEntity, employee)
		await getManager().save(newEmployee)
		return newEmployee
	}

	public static async getOne(id: number) {
		return getManager().findOne(EmployeeEntity, id)
	}

	public static async getMany(ids: number[]) {
		console.log(ids, 'ids')
		const employees = await getManager().findByIds(EmployeeEntity, ids)
		return employees
	}

	public static async getManyWithResponse(ids: number[]) {
		console.log(ids, 'ids')
		const employees = await getManager().findByIds(EmployeeEntity, ids, { relations: ["answer"] })
		return employees
	}

	public static async getAllForUser(userId: number) {
		return getManager().find(EmployeeEntity, {
			where: {
				createdByUser: userId
			}
		})
	}

	public static async updateOne(id: number, employee: Partial<EmployeeEntity>) {
		const updatedEmployee = await getManager().findOne(EmployeeEntity, id)
		if (!updatedEmployee) {
			return null
		}
		delete updatedEmployee.imageRightCondition
		const employeeToSave = {
			...employee,
			updatedAt: new Date(),
		}
		await getManager().update(EmployeeEntity, id, employeeToSave)
		const entityReturned = await getManager().findOne(EmployeeEntity, id)
		return entityReturned
	}

	public static async deleteOne(id: number) {
		const deletedEmployee = await getManager().delete(EmployeeEntity, id)
		return deletedEmployee
	}

	public static async deleteMany(ids: number[]) {
		const deletedEmployees = await getManager().delete(EmployeeEntity, ids)
		return deletedEmployees
	}
}