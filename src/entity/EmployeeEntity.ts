import { UserEntity } from './UserEntity'
import { Entity, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { FileEntity, AddressEntity } from "./"
import AnswerEntity from './AnswerEntity'
import { BaseEntity } from "./BaseEntity"

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
