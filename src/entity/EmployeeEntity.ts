import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { UserEntity } from './UserEntity'
import AnswerEntity from './AnswerEntity'
import { BaseEntity } from './BaseEntity'
import { AddressEntity } from './AddressEntity'
import { FileEntity } from './FileEntity'

@Entity()
export class EmployeeEntity extends BaseEntity {
  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ unique: true, nullable: true })
  slug: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity

  @RelationId((employee: EmployeeEntity) => employee.address)
  addressId: number

  @ManyToOne(() => UserEntity, user => user.employee)
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
}

export const employeeSearchablefields = [
  'email',
  'phone',
  'firstName',
  'lastName',
]
