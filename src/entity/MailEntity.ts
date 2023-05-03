import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import AnswerEntity from './AnswerEntity'
import { BaseEntity } from './bases/BaseEntity'

@Entity()
export class MailEntity extends BaseEntity {
  @Column({ unique: true })
  messageId: string

  @Column({ unique: true })
  messageUuid: string

  @Column()
  messageHref: string

  @ManyToOne(() => AnswerEntity, answer => answer.id, { orphanedRowAction: 'soft-delete' })
  @JoinColumn({ name: 'answerId' })
  answer: AnswerEntity

  @RelationId((mail: MailEntity) => mail.answer)
  answerId: number
}
