import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'
import { EmployeeEntity } from './employees/EmployeeEntity'
import EventEntity from './EventEntity'
import { MailEntity } from './MailEntity'

@Entity()
@Index('UNIQ_EVENT_EMPLOYEE_TWOFACTORCODE', ['event', 'employee', 'twoFactorCode'], { unique: true })
export default class AnswerEntity extends BaseEntity {
  @Column({ nullable: true, default: null })
  hasSigned: boolean | null

  @Column({ nullable: true })
  signedAt: Date | null

  @Column({ nullable: true })
  reason: string | null

  @Column({ unique: true })
  token: string

  @Column({ unique: true, select: false })
  twoFactorCode: string | null

  @Column({
    unique: true,
    nullable: true,
    update: false,
    select: false,
  })
  readonly twoFactorSecret: string | null

  @Column({ nullable: true, default: null })
  mailSendAt: Date

  @Column({ nullable: true, default: null })
  signature: string

  @ManyToOne(() => EmployeeEntity, employee => employee.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity

  @RelationId((answer: AnswerEntity) => answer.employee)
  employeeId: number

  @ManyToOne(() => EventEntity, event => event.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'eventId' })
  event: EventEntity

  @RelationId((answer: AnswerEntity) => answer.event)
  eventId: number

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
