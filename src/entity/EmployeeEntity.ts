/* eslint-disable @typescript-eslint/indent */

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { UserEntity } from './UserEntity'
import AnswerEntity from './AnswerEntity'
import { BaseEntity } from './BaseEntity'
import { AddressEntity, FileEntity } from './'

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
  address: AddressEntity | number

  @RelationId((employee: EmployeeEntity) => employee.address)
  addressId: number

  @ManyToOne(() => UserEntity, user => user.employee)
  createdByUser: number | UserEntity

  @OneToMany(() => AnswerEntity, answer => answer.employee, { cascade: true })
  answers: AnswerEntity[]

  @OneToMany(() => FileEntity, file => file.employee, { cascade: true })
  files: FileEntity[]
}

export const employeeSearchablefields = [
  'email',
  'phone',
  'firstName',
  'lastName',
]
