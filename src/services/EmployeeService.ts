import { In } from 'typeorm'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { isUserEntity } from '../utils/index'
import { APP_SOURCE } from '..'
import AnswerService from './AnswerService'

export default class EmployeeService {
  static repository = APP_SOURCE.getRepository(EmployeeEntity)

  public static async createOne(employee: Partial<EmployeeEntity>, userId: number) {
    employee.createdByUser = userId
    const newEmployee = this.repository.create(employee)
    employee.slug = `${employee.id}-${employee.firstName}-${employee.lastName}`
    await this.repository.save(newEmployee)
    return {
      ...newEmployee,
      createdByUser: userId,
    }
  }

  public static async getOne(id: number) {
    const employeefinded = await this.repository.findOne({
      where: {
        id,
      },
      relations: ['createdByUser', 'answers'],
    })

    const user = isUserEntity(employeefinded.createdByUser) && employeefinded.createdByUser
    return {
      ...employeefinded,
      createdByUser: user.id,
      events: employeefinded.answers.map(answer => answer.event),
    }
  }

  public static async getMany(ids: number[]) {
    const finded = await this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['createdByUser', 'answers'],
    })

    return finded.map(employee => {
      const user = isUserEntity(employee.createdByUser) && employee.createdByUser
      return {
        ...employee,
        createdByUser: user.id,
        events: employee.answers.map(answer => answer.event),
      }
    })
  }

  public static async getAllForUser(userId: number) {
    const employees = await this.repository.find({
      where: {
        createdByUser: userId,
      },
      relations: ['answers'],
    })

    return employees.map(employee => ({
      ...employee,
      createdByUser: userId,
      events: employee.answers.map(answer => answer.event),
    }))
  }

  public static async getAllForEvent(eventId: number) {
    const answers = await AnswerService.getAllAnswersForEvent(eventId)
    return answers.map(answer => answer.employee as EmployeeEntity)
  }

  public static async updateOne(id: number, employee: Partial<EmployeeEntity>) {
    const updatedEmployee = await this.getOne(id)
    if (!updatedEmployee) {
      return null
    }
    const employeeToSave = {
      ...employee,
      updatedAt: new Date(),
    }
    await this.repository.update(id, employeeToSave)
    return this.getOne(id)
  }

  public static async deleteOne(id: number) {
    return this.repository.delete(id)
  }

  public static async deleteMany(ids: number[]) {
    return this.repository.delete(ids)
  }

  public static async isEmployeeAlreadyExist(email: string) {
    const employee = await this.repository.findOneBy({ email })
    return !!employee
  }
}
