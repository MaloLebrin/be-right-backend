import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm"
import { FileEntity } from "."
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"

@Entity()
export default class AnswerEntity extends BaseEntity {

	@Column({ nullable: true, default: null })
	hasSigned: boolean

	@Column({ nullable: true })
	signedAt: Date

	@Column({ nullable: true })
	reason: string

	@ManyToOne(() => EmployeeEntity, employee => employee.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: "employeeId" })
	employee: number

	@ManyToOne(() => EventEntity, event => event.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: "eventId" })
	event: number

	@OneToOne(() => FileEntity, file => file.id, { cascade: true })
	@JoinColumn({ name: "fileId" })
	file: number
}

export const answerSearchFields = [
	'hasSigned',
	'employee',
	'event',
	'id',
]