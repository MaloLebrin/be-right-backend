import { UserEntity } from './UserEntity'
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import { BaseEntity } from "./BaseEntity"
import ImageRightConditionEntity from './ImageRightConditionEntity'
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

	@ManyToOne(() => UserEntity, user => user.employee)
	createdByUser: number | UserEntity

	@OneToMany(() => ImageRightConditionEntity, imagerightCondition => imagerightCondition.employee, { cascade: true })
	@JoinColumn()
	imageRightCondition: ImageRightConditionEntity[]

	@OneToMany(() => FileEntity, file => file.employee, { cascade: true })
	files: FileEntity[]

}

export const employeeSearchablefields = [
	'email',
	'phone',
	'firstName',
	'lastName',
]