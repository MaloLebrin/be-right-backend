import { Entity, Column } from "typeorm"
import { BaseEntity } from "./BaseEntity"

@Entity()
export default class ImageRightConditionEntity extends BaseEntity {

	@Column()
	name: string

	@Column({ nullable: true })
	slug: string

	@Column({ nullable: true })
	description: string

}