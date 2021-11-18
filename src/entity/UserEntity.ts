import { Entity, Column, OneToMany } from "typeorm"
import { Role } from "../types/Role"
import { SubscriptionEnum } from "../types/Subscription"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"
import { FileEntity } from "./FileEntity"

@Entity()
export class UserEntity extends BaseEntity {

    @Column({ unique: true })
    email: string

    @Column({ unique: true, nullable: true })
    password: string

    @Column({ unique: true, update: false })
    salt: string

    @Column({ unique: true, update: false })
    token: string

    @Column({ length: 100, nullable: true })
    firstName: string

    @Column({ length: 100, nullable: true })
    lastName: string

    @Column({ nullable: true })
    companyName: string

    @Column({ nullable: true })
    siret: string

    @Column({ nullable: true })
    apiKey: string

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    roles: Role

    @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
    subscription: SubscriptionEnum

    @OneToMany(() => EventEntity, event => event.createdByUser, { cascade: true })
    events: EventEntity[]

    @OneToMany(() => EmployeeEntity, employee => employee.createdByUser, { cascade: true })
    employee: EmployeeEntity[]

    @OneToMany(() => FileEntity, file => file.user, { cascade: true })
    files: FileEntity[]


}

export const userSearchableFields = [
    'email',
    'firstName',
    'lastName',
    'companyName',
    'siret',
]
