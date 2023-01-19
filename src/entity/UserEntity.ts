import { Column, Entity, JoinColumn, OneToMany, OneToOne, RelationId } from 'typeorm'
import { Role, ThemeEnum } from '../types/'
import { SubscriptionEnum } from '../types/Subscription'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './BaseEntity'
import { EmployeeEntity } from './EmployeeEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { SubscriptionEntity } from './SubscriptionEntity'

@Entity()
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  password: string

  @Column({ unique: true, update: false })
  salt: string

  @Column({ unique: true, update: false })
  token: string

  @Column({ unique: true, nullable: true })
  twoFactorRecoveryCode: string | null

  @Column({ unique: true, nullable: true })
  twoFactorSecret: string | null

  @Column({ length: 100, nullable: true })
  firstName: string

  @Column({ length: 100, nullable: true })
  lastName: string

  @Column({ nullable: true })
  companyName: string

  @Column({ nullable: true })
  siret: string

  @Column({ nullable: true })
  apiKey: string

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  roles: Role

  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
  subscriptionLabel: SubscriptionEnum

  @Column({ type: 'enum', enum: ThemeEnum, default: ThemeEnum.LIGHT })
  theme: ThemeEnum

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn()
  address: AddressEntity | number

  @RelationId((user: UserEntity) => user.address)
  addressId: number

  @OneToMany(() => EventEntity, event => event.createdByUser, { cascade: true })
  events: EventEntity[] | number[]

  @RelationId((user: UserEntity) => user.events)
  eventIds: number[]

  @OneToMany(() => EventEntity, event => event.partner, { cascade: true })
  shootingEvent: EventEntity[] | number[]

  @OneToMany(() => EmployeeEntity, employee => employee.createdByUser, { cascade: true })
  employee: EmployeeEntity[] | number[]

  @RelationId((user: UserEntity) => user.employee)
  employeeIds: number[]

  @OneToMany(() => FileEntity, file => file.createdByUser, { cascade: true })
  files: FileEntity[] | number[]

  @RelationId((user: UserEntity) => user.files)
  filesIds: number[]

  @OneToOne(() => FileEntity, file => file.createdByUser)
  @JoinColumn()
  profilePicture: FileEntity | number

  @OneToOne(() => SubscriptionEntity, { cascade: true })
  @JoinColumn()
  subscription: SubscriptionEntity

  @RelationId((user: UserEntity) => user.subscription)
  subscriptionId: number
}

export const userSearchableFields = [
  'email',
  'firstName',
  'lastName',
  'companyName',
  'siret',
  'subscription',
]
