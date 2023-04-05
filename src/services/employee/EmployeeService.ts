import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { CompanyEntity } from '../../entity/Company.entity'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import { UserEntity } from '../../entity/UserEntity'
import AnswerService from '../AnswerService'
import { ApiError } from '../../middlewares/ApiError'

export default class EmployeeService {
  repository: Repository<EmployeeEntity>
  answerService: AnswerService
  userRepository: Repository<UserEntity>
  companyRepository: Repository<CompanyEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EmployeeEntity)
    this.userRepository = APP_SOURCE.getRepository(UserEntity)
    this.answerService = new AnswerService(APP_SOURCE)
    this.companyRepository = APP_SOURCE.getRepository(CompanyEntity)
  }

  async createOne(employee: Partial<EmployeeEntity>, companyId: number) {
    const company = await this.companyRepository.findOne({ where: { id: companyId } })

    if (!company) {
      throw new ApiError(422, 'l\'entreprise n\'existe pas')
    }
    employee.company = company
    const newEmployee = this.repository.create(employee)

    await this.repository.save(newEmployee)
    await this.repository.update(newEmployee.id, {
      slug: `${newEmployee.id}-${employee.firstName}-${employee.lastName}`,
    })
    return this.getOne(newEmployee.id)
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

  async getAllForUser(companyId: number) {
    return this.repository.find({
      where: {
        company: {
          id: companyId,
        },
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
