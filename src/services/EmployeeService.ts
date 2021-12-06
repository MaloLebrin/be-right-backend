import { EmployeeEntity } from "../entity/EmployeeEntity"
import { getManager } from "typeorm"
import { UserEntity } from "../entity/UserEntity"
import AnswerEntity from "../entity/AnswerEntity"

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
		const employeefinded = await getManager().findOne(EmployeeEntity, id, { relations: ["createdByUser"] })
		const user = employeefinded.createdByUser as UserEntity
		return {
			...employeefinded,
			createdByUser: user.id
		}
	}

	public static async getMany(ids: number[]) {
		const finded = await getManager().findByIds(EmployeeEntity, ids, { relations: ["createdByUser"] })
		return finded.map((event) => {
			const user = event.createdByUser as UserEntity
			return {
				...event,
				createdByUser: user.id,
			}
		})
	}

	public static async getAllForUser(userId: number) {
		const employees = await getManager().find(EmployeeEntity, {
			where: {
				createdByUser: userId
			}
		})
		return employees.map((employee) => ({
			...employee,
			createdByUser: userId,
		}))
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
		return this.getOne(id)
	}

	public static async deleteOne(id: number) {
		return getManager().delete(EmployeeEntity, id)
	}

	public static async deleteMany(ids: number[]) {
		return getManager().delete(EmployeeEntity, ids)
	}

}