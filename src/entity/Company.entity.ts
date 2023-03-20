import { Column, Entity, JoinColumn, OneToMany, OneToOne, RelationId } from 'typeorm'
import { SubscriptionEnum } from '../types/Subscription'
import { BaseEntity } from './bases/BaseEntity'
import EventEntity from './EventEntity'
import { AddressEntity } from './AddressEntity'
import { EmployeeEntity } from './employees/EmployeeEntity'
import { SubscriptionEntity } from './SubscriptionEntity'
import { FileEntity } from './FileEntity'
import { UserEntity } from './UserEntity'
import { GroupEntity } from './employees/Group.entity'

@Entity()
export class CompanyEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  siret: string

  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC, nullable: true })
  subscriptionLabel: SubscriptionEnum

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  onwer: UserEntity

  @RelationId((company: CompanyEntity) => company.onwer)
  readonly onwerId: number

  @OneToMany(() => UserEntity, user => user.company, { cascade: true })
  @JoinColumn()
  users: UserEntity[]

  @RelationId((company: CompanyEntity) => company.users)
  userIds: number[]

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity

  @RelationId((company: CompanyEntity) => company.address)
  addressId: number

  @OneToMany(() => EventEntity, event => event.company, { cascade: true })
  events: EventEntity[]

  @RelationId((company: CompanyEntity) => company.events)
  eventIds: number[]

  @OneToMany(() => EmployeeEntity, employee => employee.company, { cascade: true })
  @JoinColumn()
  employees: EmployeeEntity[]

  @RelationId((company: CompanyEntity) => company.employees)
  employeeIds: number[]

  @OneToMany(() => GroupEntity, group => group.company, { cascade: true })
  @JoinColumn()
  groups: GroupEntity[]

  @RelationId((company: CompanyEntity) => company.groups)
  groupIds: number[]

  @OneToMany(() => FileEntity, file => file.company, { cascade: true })
  files: FileEntity[]

  @RelationId((company: CompanyEntity) => company.files)
  filesIds: number[]

  @OneToOne(() => SubscriptionEntity, { cascade: true })
  @JoinColumn()
  subscription: SubscriptionEntity

  @RelationId((company: CompanyEntity) => company.subscription)
  subscriptionId: number
}
