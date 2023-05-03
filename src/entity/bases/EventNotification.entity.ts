import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../../types'
import AnswerEntity from '../AnswerEntity'
import EventEntity from '../EventEntity'
import { NotificationEntity } from '../notifications/Notification.entity'
import { EmployeeEntity } from '../employees/EmployeeEntity'
import { BaseEntity } from './BaseEntity'

@Entity()
@Index('UNIQ_EVENT_NAME', ['name', 'event'], { unique: true })
@Index('UNIQ_ANSWER_NAME', ['name', 'answer'], { unique: true })
@Index('UNIQ_EMPLOYEE_NAME', ['name', 'employee'], { unique: true })
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

  @ManyToOne(() => EventEntity, { nullable: true })
  @JoinColumn()
  event: EventEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.event)
  eventId: number

  @ManyToOne(() => AnswerEntity, { nullable: true })
  @JoinColumn()
  answer: AnswerEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.answer)
  answerId: number

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  employee: EmployeeEntity

  @RelationId((eventNotif: EventNotificationEntity) => eventNotif.employee)
  employeeId: number
}
