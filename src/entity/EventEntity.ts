import { Column, Entity, ManyToOne, OneToMany } from "typeorm"
import { EventStatusEnum } from "../types/Event"
import { BaseEntity } from "./BaseEntity"
import { FileEntity } from "./FileEntity"
import { UserEntity } from "./UserEntity"

@Entity()
export default class EventEntity extends BaseEntity {

    @Column()
    name: string

    @Column()
    start: Date

    @Column()
    end: Date

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
    createdByUser: UserEntity | number

    @OneToMany(() => FileEntity, file => file.event, { cascade: true })
    files: FileEntity[]

}

export const eventSearchableFields = [
    'name',
    'address',
    'city',
]