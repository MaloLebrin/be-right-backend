import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'
import { UserEntity } from '../UserEntity'
import { EmployeeEntity } from './EmployeeEntity'

@Entity()
export class GroupEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  description: string | null

  @ManyToOne(() => UserEntity, user => user.employees)
  createdByUser: UserEntity

  @RelationId((group: GroupEntity) => group.createdByUser)
  createdByUserId: number

  @ManyToMany(() => EmployeeEntity)
  @JoinTable()
  employees: EmployeeEntity[]

  @RelationId((group: GroupEntity) => group.employees)
  employeeIds: number[]
}
