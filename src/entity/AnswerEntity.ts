import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
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

	@ManyToOne(() => EmployeeEntity, employee => employee.events)
	@JoinColumn({ name: "id" })
	employee: number

	@ManyToOne(() => EventEntity, event => event.employees)
	@JoinColumn({ name: "id" })
	event: number
}
