import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { GroupEntity } from '../../entity/employees/Group.entity'
import { ApiError } from '../../middlewares/ApiError'
import type { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import EmployeeService from './EmployeeService'

export type GroupCreationPayload = Pick<GroupEntity, 'name' | 'description' | 'employeeIds'>

export class GroupService {
  private repository: Repository<GroupEntity>
  private employeeService: EmployeeService

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(GroupEntity)
    this.employeeService = new EmployeeService(APP_SOURCE)
  }

  async createOne(groupPayload: GroupCreationPayload, companyId: number) {
    const { name, description, employeeIds } = groupPayload

    const employees = await this.employeeService.getMany(employeeIds)

    const groupCreated = this.repository.create({
      name,
      description,
      employees,
      company: {
        id: companyId,
      },
    })
    return await this.repository.save(groupCreated)
  }

  async getOne(id: number, companyId: number, withRelation?: boolean) {
    return this.repository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
      relations: {
        company: withRelation,
        employees: withRelation,
      },
    })
  }

  async getMany(ids: number[], companyId: number, withRelation?: boolean) {
    return this.repository.find({
      where: {
        id: In(ids),
        company: {
          id: companyId,
        },
      },
      relations: {
        company: withRelation,
        employees: withRelation,
      },
    })
  }

  async getAllForUser(companyId: number, withRelation?: boolean) {
    return this.repository.find({
      where: {
        company: {
          id: companyId,
        },
      },
      relations: {
        company: withRelation,
        employees: withRelation,
      },
    })
  }

  async getAllForEmployee(employeeId: number, companyId: number, withRelation?: boolean) {
    return this.repository.find({
      where: {
        employees: {
          id: employeeId,
        },
        company: {
          id: companyId,
        },
      },
      relations: {
        company: withRelation,
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

  async removeEmployeesOnGroup(employeesToRemove: EmployeeEntity[]) {
    const groupIds = employeesToRemove.reduce((acc, emp) => [...acc, ...emp.groupIds], [] as number[])
    const existingGroups = await this.repository.find({
      where: {
        id: In(groupIds),
      },
      relations: { employees: true },
    })

    if (existingGroups?.length > 0) {
      const employeeIdsToRemove = employeesToRemove.map(emp => emp.id)

      await this.repository.save(existingGroups.map(group => ({
        ...group,
        employees: group.employees.filter(emp => !employeeIdsToRemove.includes(emp.id)),
        employeeIdsToRemove: group.employeeIds.filter(id => !employeeIdsToRemove.includes(id)),
      })))
    }
  }
}
