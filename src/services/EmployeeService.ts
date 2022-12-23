import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { isUserEntity } from '../utils/index'
import type { UserEntity } from '../entity/UserEntity'
import AnswerService from './AnswerService'

export default class EmployeeService {
  repository: Repository<EmployeeEntity>
  answerService: AnswerService

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EmployeeEntity)
    this.answerService = new AnswerService(APP_SOURCE)
  }

  async createOne(employee: Partial<EmployeeEntity>, userId: number) {
    employee.createdByUser = userId
    const newEmployee = this.repository.create(employee)
    employee.slug = `${employee.id}-${employee.firstName}-${employee.lastName}`
    await this.repository.save(newEmployee)
    return {
      ...newEmployee,
      createdByUser: userId,
    }
  }

  async getOne(id: number) {
    const employeefinded = await this.repository.findOne({
      where: {
        id,
      },
      relations: ['createdByUser', 'answers'],
    })

    const user = isUserEntity(employeefinded.createdByUser) && employeefinded.createdByUser as UserEntity
    return {
      ...employeefinded,
      createdByUser: user.id,
      events: employeefinded.answers.map(answer => answer.event),
    }
  }

  async getMany(ids: number[]) {
    const finded = await this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['createdByUser', 'answers'],
    })

    return finded.map(employee => {
      const user = isUserEntity(employee.createdByUser) && employee.createdByUser as UserEntity
      return {
        ...employee,
        createdByUser: user.id,
        events: employee.answers.map(answer => answer.event),
      }
    })
  }

  async getAllForUser(userId: number) {
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

  async getAllForEvent(eventId: number) {
    const answers = await this.answerService.getAllAnswersForEvent(eventId)
    return answers.map(answer => answer.employee as EmployeeEntity)
  }

  async updateOne(id: number, employee: Partial<EmployeeEntity>) {
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

  async deleteOne(id: number) {
    return this.repository.delete(id)
  }

  async deleteMany(ids: number[]) {
    return this.repository.delete(ids)
  }

  async isEmployeeAlreadyExist(email: string) {
    const employee = await this.repository.findOneBy({ email })
    return !!employee
  }
}
