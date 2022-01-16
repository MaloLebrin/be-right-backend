import { UserEntity } from './UserEntity'
import { Entity, Column, OneToMany, ManyToOne } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import { FileEntity } from './FileEntity'
import AnswerEntity from './AnswerEntity'

@Entity()
export class EmployeeEntity extends BaseEntity {

	@Column()
	email: string

	@Column()
	phone: string

	@Column({ unique: true, nullable: true })
	slug: string

	@Column()
	firstName: string

	@Column()
	lastName: string

	@ManyToOne(() => UserEntity, user => user.employee)
	createdByUser: number | UserEntity

	@OneToMany(() => AnswerEntity, answer => answer.employee, { cascade: true })
	answers: AnswerEntity[]

	@OneToMany(() => FileEntity, file => file.employee, { cascade: true })
	files: FileEntity[]

}

export const employeeSearchablefields = [
	'email',
	'phone',
	'firstName',
	'lastName',
]