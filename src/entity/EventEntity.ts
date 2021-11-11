import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { EventStatusEnum } from "@/types/Event"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import { FileEntity } from "./FileEntity"
import ImageRightConditionEntity from "./ImageRightConditionEntity"
import { UserEntity } from "./UserEntity"

@Entity()
export default class EventEntity extends BaseEntity {

    @Column()
    name: string

    @Column()
    startDate: Date

    @Column()
    endDate: Date

    @Column({ type: 'enum', enum: EventStatusEnum, default: EventStatusEnum.CREATE })
    status: EventStatusEnum

    @Column({ nullable: true })
    address: string

    @Column({ nullable: true })
    postalCode: number

    @Column({ nullable: true })
    city: string

    @Column({ nullable: true })
    country: string

    @Column({ default: 0 })
    signatureCount: number

    @Column({ default: 0 })
    totalSignatureNeeded: number

    @ManyToOne(() => UserEntity, user => user.events, { onDelete: 'CASCADE' })
    user: number

    @ManyToMany(() => EmployeeEntity, employee => employee.events)
    employees: EmployeeEntity[]

    @OneToMany(() => ImageRightConditionEntity, imagerightCondition => imagerightCondition.event, { cascade: true })
    @JoinColumn()
    imageRightCondition: ImageRightConditionEntity[]

    @OneToMany(() => FileEntity, file => file.event, { cascade: true })
    files: FileEntity[]

}

export const eventSearchableFields = [
    'name',
    'address',
    'city',
]