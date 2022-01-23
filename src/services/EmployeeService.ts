import { EmployeeEntity } from "../entity/EmployeeEntity"
import { getManager } from "typeorm"
import { UserEntity } from "../entity/UserEntity"
import uid2 from 'uid2'
import { SHA256 } from 'crypto-js'

export default class EmployeeService {

  public static async createOne(employee: Partial<EmployeeEntity>, userId: number) {
    employee.createdByUser = userId
    employee.slug = SHA256(uid2(32)).toString()
    const newEmployee = getManager().create(EmployeeEntity, employee)
    await getManager().save(newEmployee)
    return {
      ...newEmployee,
      createdByUser: userId,
    }
  }

  public static async getOne(id: number) {
    const employeefinded = await getManager().findOne(EmployeeEntity, id, { relations: ["createdByUser", "answers"] })
    const user = employeefinded.createdByUser as UserEntity
    return {
      ...employeefinded,
      createdByUser: user.id,
      events: employeefinded.answers.map(answer => answer.event),
    }
  }

  public static async getMany(ids: number[]) {
    const finded = await getManager().findByIds(EmployeeEntity, ids, { relations: ["createdByUser", "answers"] })
    return finded.map((employee) => {
      const user = employee.createdByUser as UserEntity
      return {
        ...employee,
        createdByUser: user.id,
        events: employee.answers.map(answer => answer.event),
      }
    })
  }

  public static async getAllForUser(userId: number) {
    const employees = await getManager().find(EmployeeEntity, {
      where: {
        createdByUser: userId
      },
      relations: ["createdByUser", "answers"],
    })

    return employees.map((employee) => ({
      ...employee,
      createdByUser: userId,
      events: employee.answers.map(answer => answer.event),
    }))
  }

  public static async updateOne(id: number, employee: Partial<EmployeeEntity>) {
    const updatedEmployee = await getManager().findOne(EmployeeEntity, id)
    if (!updatedEmployee) {
      return null
    }
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
