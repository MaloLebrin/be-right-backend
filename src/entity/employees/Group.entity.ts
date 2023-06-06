import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'
import { CompanyEntity } from '../Company.entity'
import { EmployeeEntity } from './EmployeeEntity'

@Entity()
export class GroupEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string | null

  @ManyToOne(() => CompanyEntity, company => company.groups)
  company: CompanyEntity

  @RelationId((group: GroupEntity) => group.company)
  companyId: number

  @ManyToMany(() => EmployeeEntity)
  @JoinTable()
  employees: EmployeeEntity[]

  @RelationId((group: GroupEntity) => group.employees)
  employeeIds: number[]
}

export const groupSearchablefields = [
  'name',
]

export const groupRelationFields = [
  'company.name',
  // 'company.users.firstName',
  // 'company.users.lastName',
  'employees.firstName',
  'employees.lastName',
]
