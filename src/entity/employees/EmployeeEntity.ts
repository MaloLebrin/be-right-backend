import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import AnswerEntity from '../AnswerEntity'
import { AddressEntity } from '../AddressEntity'
import { FileEntity } from '../FileEntity'
import { BasePersonEntity } from '../bases/BasePerson'
import { CompanyEntity } from '../Company.entity'
import { GroupEntity } from './Group.entity'

@Entity()
export class EmployeeEntity extends BasePersonEntity {
  @Column({ nullable: true })
  phone: string

  @Column({ unique: true, nullable: true })
  slug: string

  @Column({ nullable: true, default: null })
  signature: string

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity

  @RelationId((employee: EmployeeEntity) => employee.address)
  addressId: number

  @ManyToOne(() => CompanyEntity, company => company.employees)
  @JoinColumn()
  company: CompanyEntity

  @RelationId((employee: EmployeeEntity) => employee.company)
  companyId: number

  @OneToMany(() => AnswerEntity, answer => answer.employee, { cascade: true })
  answers: AnswerEntity[]

  @RelationId((employee: EmployeeEntity) => employee.answers)
  answersIds: number[]

  @OneToMany(() => FileEntity, file => file.employee, { cascade: true })
  files: FileEntity[]

  @RelationId((employee: EmployeeEntity) => employee.files)
  filesIds: number[]

  @ManyToMany(() => GroupEntity, group => group.employees)
  groups: GroupEntity[]

  @RelationId((emp: EmployeeEntity) => emp.groups)
  groupIds: number[]
}

export const employeeSearchablefields = [
  'email',
  'phone',
  'firstName',
  'lastName',
]

export const employeeRelationFields = [
  'company.name',
]
