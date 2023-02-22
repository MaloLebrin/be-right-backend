import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'
import { EventNotificationEntity } from './bases/EventNotification.entity'
import { EmployeeEntity } from './EmployeeEntity'
import EventEntity from './EventEntity'
import { MailEntity } from './MailEntity'

@Entity()
export default class AnswerEntity extends BaseEntity {
  @Column({ nullable: true, default: null })
  hasSigned: boolean | null

  @Column({ nullable: true })
  signedAt: Date | null

  @Column({ nullable: true })
  reason: string | null

  @Column({
    unique: true,
    nullable: true,
  })
  token: string

  @Column({ nullable: true, default: null })
  mailSendAt: Date

  @ManyToOne(() => EmployeeEntity, employee => employee.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'employeeId' })
  employee: number | EmployeeEntity

  @RelationId((answer: AnswerEntity) => answer.employee)
  employeeId: number

  @ManyToOne(() => EventEntity, event => event.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'eventId' })
  event: EventEntity

  @RelationId((answer: AnswerEntity) => answer.event)
  eventId: number

  @ManyToOne(() => EventNotificationEntity, eventNotif => eventNotif.answers)
  eventNotification: EventNotificationEntity

  @RelationId((answer: AnswerEntity) => answer.eventNotification)
  eventNotificationId: number

  @OneToMany(() => MailEntity, mail => mail.answer, { cascade: true })
  mails: MailEntity[]

  @RelationId((answer: AnswerEntity) => answer.mails)
  mailsIds: number[]
}

export const answerSearchFields = [
  'hasSigned',
  'employee',
  'event',
]
