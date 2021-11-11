import { UserEntity } from './UserEntity'
import { Entity, Column, OneToMany, JoinColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import ImageRightConditionEntity from './ImageRightConditionEntity'
import EventEntity from './EventEntity'
import { FileEntity } from './FileEntity'

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

	@OneToMany(() => FileEntity, file => file.employee, { cascade: true })
	files: FileEntity[]

}

export const employeeSearchablefields = [
	'email',
	'phone',
	'firstName',
	'lastName',
]