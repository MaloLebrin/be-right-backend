import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { GroupEntity } from '../../entity/employees/Group.entity'
import { ApiError } from '../../middlewares/ApiError'
import EmployeeService from './EmployeeService'

export type GroupCreationPayload = Pick<GroupEntity, 'name' | 'description' | 'employeeIds'>

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

  async getOne(id: number, userId: number, withRelation?: boolean) {
    return this.repository.findOne({
      where: {
        id,
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

  async getMany(ids: number[], userId: number, withRelation?: boolean) {
    return this.repository.find({
      where: {
        id: In(ids),
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

  async updateOne(id: number, userId: number, group: Partial<GroupEntity>) {
    const existingGroup = await this.getOne(id, userId, true)

    if (!existingGroup) {
      throw new ApiError(422, 'le groupe n\'éxiste pas')
    }

    const { name, description, employeeIds } = group

    let newEmployeeIds = []
    if (employeeIds?.length > 0) {
      newEmployeeIds = [...employeeIds]
    } else {
      newEmployeeIds = [existingGroup.employeeIds]
    }

    const employees = await this.employeeService.getMany(newEmployeeIds)

    existingGroup.employees = employees
    existingGroup.name = name || existingGroup.name
    existingGroup.description = description || existingGroup.description
    return await this.repository.save(existingGroup)
  }

  async deleteOne(id: number) {
    return this.repository.softDelete(id)
  }
}
