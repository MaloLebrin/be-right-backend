import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"

@Entity()
export default class ImageRightConditionEntity extends BaseEntity {

	@Column()
	name: string

	@Column({ nullable: true })
	slug: string

	@Column({ nullable: true })
	description: string

	@ManyToOne(() => EventEntity, event => event.imageRightCondition)
	@JoinColumn()
	event: number

	@OneToMany(() => EmployeeEntity, employee => employee.imageRightCondition)
	@JoinColumn()
	employee: EventEntity[]

}