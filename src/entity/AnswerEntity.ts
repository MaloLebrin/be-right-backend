import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"
import { FileEntity } from "./FileEntity"

@Entity()
export default class AnswerEntity extends BaseEntity {

  @Column({ nullable: true, default: null })
  hasSigned: boolean | null

  @Column({ nullable: true })
  signedAt: Date | null

  @Column({ nullable: true })
  reason: string | null

  @ManyToOne(() => EmployeeEntity, employee => employee.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "employeeId" })
  employee: number | EmployeeEntity

  @ManyToOne(() => EventEntity, event => event.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "eventId" })
  event: number

  @OneToOne(() => FileEntity, file => file.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "imageRight", referencedColumnName: 'id' })
  imageRight: number | FileEntity
}

export const answerSearchFields = [
  'hasSigned',
  'employee',
  'event',
]
