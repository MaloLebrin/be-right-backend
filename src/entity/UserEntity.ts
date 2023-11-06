import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { Role } from '../types/'
import { BaseAuthEntity } from './bases/AuthEntity'
import { CompanyEntity } from './Company.entity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'
import { NotificationSubcriptionEntity } from './notifications/NotificationSubscription.entity'
import { BadgeEntity } from './repositories/Badge.entity'

@Entity()
export class UserEntity extends BaseAuthEntity {
  @Column({ nullable: true, default: null, unique: true })
  stripeCustomerId: string

  @Column({ nullable: true, default: null })
  signature: string

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  roles: Role

  @OneToOne(() => FileEntity, { cascade: true })
  @JoinColumn()
  profilePicture: FileEntity

  @RelationId((user: UserEntity) => user.profilePicture)
  profilePictureId: number

  @OneToMany(() => EventEntity, event => event.partner, { cascade: true })
  shootingEvent: EventEntity[]

  @OneToMany(() => NotificationSubcriptionEntity, notificationSubcription => notificationSubcription.createdByUser, { cascade: true })
  notificationSubscriptions: NotificationSubcriptionEntity[]

  @RelationId((user: UserEntity) => user.notificationSubscriptions)
  notificationSubscriptionIds: number[]

  @ManyToOne(() => CompanyEntity, user => user.users)
  company: CompanyEntity

  @RelationId((user: UserEntity) => user.company)
  companyId: number

  @ManyToMany(() => BadgeEntity)
  @JoinTable()
  badges: BadgeEntity[]

  @RelationId((user: UserEntity) => user.badges)
  badgeIds: number[]
}

export const userSearchableFields = [
  'email',
  'firstName',
  'lastName',
]

export const userRelationFields = [
  'company.name',
]
