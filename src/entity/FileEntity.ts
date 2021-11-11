import { Column, Entity, ManyToOne, OneToMany } from "typeorm"
import { FileTypeEnum } from "../types/File"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"
import { UserEntity } from "./UserEntity"

@Entity()
export class FileEntity extends BaseEntity {

	@Column()
	fileName: string

	@Column()
	path: string

	@Column({ type: "enum", enum: FileTypeEnum, default: FileTypeEnum.IMAGE_RIGHT })
	type: FileTypeEnum

	@Column({ nullable: true })
	description: string

	@ManyToOne(() => EventEntity, event => event.files)
	event: number

	@ManyToOne(() => EmployeeEntity, employee => employee.files)
	employee: number

	@ManyToOne(() => UserEntity, user => user.files)
	user: number
}

export const filesSearchableFields = [
	'fileName',
	'type',
]