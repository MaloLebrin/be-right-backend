import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../../types'
import { BaseEntity } from '../bases/BaseEntity'
import { UserEntity } from '../UserEntity'
import { NotificationEntity } from './Notification.entity'

@Entity()
@Index(['type', 'createdByUser'], { unique: true })
export class NotificationSubcriptionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum

  @OneToMany(() => NotificationEntity, notif => notif.subscriberId, { cascade: true })
  @JoinColumn()
  notifications: NotificationEntity[]

  @RelationId((notifSuscribtion: NotificationSubcriptionEntity) => notifSuscribtion.notifications)
  notificationIds: number[]

  @ManyToOne(() => UserEntity, user => user.notificationSubscriptions)
  @JoinColumn()
  createdByUser: UserEntity

  @RelationId((notifSubscription: NotificationSubcriptionEntity) => notifSubscription.createdByUser)
  createdByUserId: number
}
