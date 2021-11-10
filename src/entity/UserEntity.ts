import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from "typeorm"
import { Role } from "../types/Role"
import { Subscription } from "../types/Subscription"
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"

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

    @Column({ type: 'enum', enum: Subscription, default: Subscription.BASIC })
    subscription: Subscription

    @OneToMany(() => EventEntity, event => event.user, { cascade: true })
    events: EventEntity[]

    @OneToMany(() => EmployeeEntity, employee => employee.user, { cascade: true })
    employee: EmployeeEntity[]

}

export const userSearchableFields = [
    'email',
    'firstName',
    'lastName',
    'companyName',
    'siret',
]
