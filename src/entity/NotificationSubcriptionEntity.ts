import { Column, Entity, JoinColumn, OneToMany, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../types'
import { BaseEntity } from './BaseEntity'
import { NotificationEntity } from './NotificationEntity'

@Entity()
export class NotificationSubcriptionEntity extends BaseEntity {
  @Column({
    type: 'set',
    enum: NotificationTypeEnum,
    default: [
      NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
      NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
      // FIXME not a good idea
    ],
  })
  types: NotificationTypeEnum[]

  @OneToMany(() => NotificationEntity, notif => notif.subscriberId, { cascade: true })
  @JoinColumn()
  notifications: NotificationEntity[]

  @RelationId((notifSuscribtion: NotificationSubcriptionEntity) => notifSuscribtion.notifications)
  notificationIds: number[]
}
