import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { GroupEntity } from '../../entity/employees/Group.entity'
import EmployeeService from './EmployeeService'

type GroupCreationPayload = Pick<GroupEntity, 'name' | 'description' | 'employeeIds'>

export class GroupService {
  repository: Repository<GroupEntity>
  employeeService: EmployeeService

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(GroupEntity)
    this.employeeService = new EmployeeService(APP_SOURCE)
  }

  async createOne(groupPayload: GroupCreationPayload, userId: number) {
    const { name, description, employeeIds } = groupPayload

    const employees = await this.employeeService.getMany(employeeIds)

    const groupCreated = this.repository.create({
      name,
      description,
      employees,
      createdByUser: {
        id: userId,
      },
    })
    return await this.repository.save(groupCreated)
  }

  async getOne(id: number, withRelation?: boolean) {
    return this.repository.findOne({
      where: {
        id,
      },
      relations: {
        createdByUser: withRelation,
        employees: withRelation,
      },
    })
  }

  async getMany(ids: number[], withRelation?: boolean) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: {
        createdByUser: withRelation,
        employees: withRelation,
      },
    })
  }

  async getAllForUser(userId: number, withRelation?: boolean) {
    return this.repository.find({
      where: {
        createdByUser: {
          id: userId,
        },
      },
      relations: {
        createdByUser: withRelation,
        employees: withRelation,
      },
    })
  }

  async updateOne(id: number, group: Partial<GroupEntity>) {
    await this.repository.update(id, group)
    return this.getOne(id)
  }

  async deleteOne(id: number) {
    return this.repository.softDelete(id)
  }
}
