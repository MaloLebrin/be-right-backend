import { Column, Entity, JoinColumn, OneToMany, OneToOne, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../../types'
import AnswerEntity from '../AnswerEntity'
import EventEntity from '../EventEntity'
import { NotificationEntity } from '../notifications/Notification.entity'
import { EmployeeEntity } from '../employees/EmployeeEntity'
import { BaseEntity } from './BaseEntity'

@Entity()
export class EventNotificationEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  name: NotificationTypeEnum

  @OneToMany(() => NotificationEntity, notif => notif.eventNotification)
  notifications: NotificationEntity[]

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.notifications)
  notificationIds: number[]

  @OneToOne(() => EventEntity, { nullable: true })
  @JoinColumn()
  event: EventEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.event)
  eventId: number

  @OneToOne(() => AnswerEntity, { nullable: true })
  @JoinColumn()
  answer: AnswerEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.answer)
  answerId: number

  @OneToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  employee: EmployeeEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.employee)
  employeeId: number
}
