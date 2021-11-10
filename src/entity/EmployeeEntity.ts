import { UserEntity } from './UserEntity'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import ImageRightConditionEntity from './ImageRightConditionEntity'
import EventEntity from './EventEntity'

@Entity()
export class EmployeeEntity extends BaseEntity {

	@Column()
	email: string

	@Column()
	phone: string

	@Column()
	firstName: string

	@Column()
	lastName: string

	@Column({ default: false })
	hasSigned: boolean

	@ManyToOne(() => UserEntity, user => user.employee)
	user: number

	@OneToMany(() => ImageRightConditionEntity, imagerightCondition => imagerightCondition.employee, { cascade: true })
	@JoinColumn()
	imageRightCondition: ImageRightConditionEntity[]

	@ManyToMany(() => EventEntity, event => event.employees, { cascade: true })
	@JoinTable()
	events: EventEntity[]
}

export const employeeSearchablefields = [
	'email',
	'phone',
	'firstName',
	'lastName',
]