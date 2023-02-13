import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import AnswerEntity from './AnswerEntity'
import { BaseEntity } from './BaseEntity'

@Entity()
export class MailEntity extends BaseEntity {
  @Column()
  messageId: string

  @Column()
  messageHref: string

  @ManyToOne(() => AnswerEntity, answer => answer.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'answerId' })
  answer: AnswerEntity

  @RelationId((mail: MailEntity) => mail.answer)
  answerId: number
}
