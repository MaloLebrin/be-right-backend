import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { EmployeeEntity } from './EmployeeEntity'
import EventEntity from './EventEntity'

@Entity()
export default class AnswerEntity extends BaseEntity {
  @Column({ nullable: true, default: null })
  hasSigned: boolean | null

  @Column({ nullable: true })
  signedAt: Date | null

  @Column({ nullable: true })
  reason: string | null

  @ManyToOne(() => EmployeeEntity, employee => employee.id)
  @JoinColumn({ name: 'employeeId' })
  employee: number | EmployeeEntity

  @RelationId((answer: AnswerEntity) => answer.employee)
  employeeId: number

  @ManyToOne(() => EventEntity, event => event.id, { cascade: true })
  @JoinColumn({ name: 'eventId' })
  event: number

  @RelationId((answer: AnswerEntity) => answer.event)
  eventId: number
}

export const answerSearchFields = [
  'hasSigned',
  'employee',
  'event',
]
