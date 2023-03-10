import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { UserEntity } from '../UserEntity'
import AnswerEntity from '../AnswerEntity'
import { AddressEntity } from '../AddressEntity'
import { FileEntity } from '../FileEntity'
import { BasePersonEntity } from '../bases/BasePerson'
import { GroupEntity } from './Group.entity'

@Entity()
@Index(['id', 'createdByUser', 'firstName', 'lastName', 'email'], { unique: true })
export class EmployeeEntity extends BasePersonEntity {
  @Column({ nullable: true })
  phone: string

  @Column({ unique: true, nullable: true })
  slug: string

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity

  @RelationId((employee: EmployeeEntity) => employee.address)
  addressId: number

  @ManyToOne(() => UserEntity, user => user.employees)
  createdByUser: UserEntity

  @RelationId((employee: EmployeeEntity) => employee.createdByUser)
  createdByUserId: number

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
