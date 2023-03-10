import { Column, Entity, JoinColumn, OneToMany, OneToOne, RelationId } from 'typeorm'
import { Role } from '../types/'
import { SubscriptionEnum } from '../types/Subscription'
import { AddressEntity } from './AddressEntity'
import { BaseAuthEntity } from './bases/AuthEntity'
import { EmployeeEntity } from './employees/EmployeeEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { NotificationSubcriptionEntity } from './notifications/NotificationSubscription.entity'
import { SubscriptionEntity } from './SubscriptionEntity'

@Entity()
export class UserEntity extends BaseAuthEntity {
  @Column({ nullable: true })
  companyName: string

  @Column({ nullable: true })
  siret: string

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  roles: Role

  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
  subscriptionLabel: SubscriptionEnum

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity

  @RelationId((user: UserEntity) => user.address)
  addressId: number

  @OneToMany(() => EventEntity, event => event.createdByUser, { cascade: true })
  events: EventEntity[]

  @RelationId((user: UserEntity) => user.events)
  eventIds: number[]

  @OneToMany(() => EmployeeEntity, employee => employee.createdByUser, { cascade: true })
  @JoinColumn()
  employees: EmployeeEntity[]

  @RelationId((user: UserEntity) => user.employees)
  employeeIds: number[]

  @OneToMany(() => FileEntity, file => file.createdByUser, { cascade: true })
  files: FileEntity[]

  @RelationId((user: UserEntity) => user.files)
  filesIds: number[]

  @OneToOne(() => FileEntity, file => file.createdByUser)
  @JoinColumn()
  profilePicture: FileEntity

  @OneToOne(() => SubscriptionEntity, { cascade: true })
  @JoinColumn()
  subscription: SubscriptionEntity

  @RelationId((user: UserEntity) => user.subscription)
  subscriptionId: number

  @OneToMany(() => EventEntity, event => event.partner, { cascade: true })
  shootingEvent: EventEntity[]

  @OneToMany(() => NotificationSubcriptionEntity, notificationSubcription => notificationSubcription.createdByUser, { cascade: true })
  notificationSubscriptions: NotificationSubcriptionEntity[]

  @RelationId((user: UserEntity) => user.notificationSubscriptions)
  notificationSubscriptionIds: number[]
}

export const userSearchableFields = [
  'email',
  'firstName',
  'lastName',
  'companyName',
  'siret',
]

// TODO use select in column option to remove field in find methods
