import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import AnswerService from './AnswerService'

export default class EmployeeService {
  repository: Repository<EmployeeEntity>
  answerService: AnswerService

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EmployeeEntity)
    this.answerService = new AnswerService(APP_SOURCE)
  }

  async createOne(employee: Partial<EmployeeEntity>, userId: number) {
    employee.createdByUserId = userId
    const newEmployee = this.repository.create(employee)
    employee.slug = `${employee.id}-${employee.firstName}-${employee.lastName}`
    await this.repository.save(newEmployee)
    return newEmployee
  }

  async getOne(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
    })
  }

  async getMany(ids: number[]) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    })
  }

  async getAllForUser(userId: number) {
    return this.repository.find({
      where: {
        createdByUserId: userId,
      },
    })
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
    return this.repository.softDelete(id)
  }

  async deleteMany(ids: number[]) {
    return this.repository.softDelete(ids)
  }

  async isEmployeeAlreadyExist(email: string) {
    const employee = await this.repository.findOneBy({ email })
    return !!employee
  }
}
