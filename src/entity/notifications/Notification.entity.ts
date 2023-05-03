import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../../types'
import { BaseEntity } from '../bases/BaseEntity'
import { EventNotificationEntity } from '../bases/EventNotification.entity'
import { NotificationSubcriptionEntity } from './NotificationSubscription.entity'

@Entity()
export class NotificationEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum

  @Column({ default: null, nullable: true })
  title: string

  @Column({ default: null, nullable: true })
  description: string

  @Column({ default: null, nullable: true })
  readAt: Date

  @ManyToOne(() => NotificationSubcriptionEntity, subscriber => subscriber.notifications)
  subscriber: NotificationSubcriptionEntity

  @RelationId((eventNotif: NotificationEntity) => eventNotif.subscriber)
  subscriberId: number

  @ManyToOne(() => EventNotificationEntity, eventNotif => eventNotif.notifications)
  eventNotification: EventNotificationEntity

  @RelationId((eventNotif: NotificationEntity) => eventNotif.eventNotification)
  eventNotificationId: number
}
