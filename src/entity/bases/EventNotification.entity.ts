import { Column, Entity, JoinColumn, OneToMany, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../../types'
import AnswerEntity from '../AnswerEntity'
import EventEntity from '../EventEntity'
import { NotificationEntity } from '../notifications/Notification.entity'
import { BaseEntity } from './BaseEntity'

@Entity()
export class EventNotificationEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  name: NotificationTypeEnum

  @OneToMany(() => NotificationEntity, notif => notif.eventNotification)
  @JoinColumn()
  notifications: NotificationEntity[]

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.notifications)
  notificationIds: number[]

  @OneToMany(() => EventEntity, event => event.createdByUser, { nullable: true })
  @JoinColumn()
  events: EventEntity[]

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.events)
  eventIds: number[]

  @OneToMany(() => AnswerEntity, answer => answer.eventNotification, { nullable: true })
  @JoinColumn()
  answers: AnswerEntity[]

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.answers)
  answerIds: number[]
}
