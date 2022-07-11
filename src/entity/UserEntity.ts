import { Entity, Column, OneToMany, OneToOne, JoinColumn } from "typeorm"
import { Role } from "../types/Role"
import { SubscriptionEnum } from "../types/Subscription"
import { AddressEntity, EmployeeEntity, FileEntity } from "./"
import { BaseEntity } from "./BaseEntity"
import EventEntity from "./EventEntity"

export enum ThemeEnum {
  LIGHT = 'light',
  DARK = 'dark'
}

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

  @Column({ unique: true, nullable: true })
  twoFactorRecoveryCode: string | null

  @Column({ unique: true, nullable: true })
  twoFactorSecret: string | null

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

  @Column({ type: 'enum', enum: ThemeEnum, default: ThemeEnum.LIGHT })
  theme: ThemeEnum

  @OneToMany(() => AddressEntity, address => address.user, { cascade: true })
  address: AddressEntity[] | number[]

  @OneToMany(() => EventEntity, event => event.createdByUser, { cascade: true })
  events: EventEntity[] | number[]

  @OneToMany(() => EmployeeEntity, employee => employee.createdByUser, { cascade: true })
  employee: EmployeeEntity[] | number[]

  @OneToMany(() => FileEntity, file => file.createdByUser, { cascade: true })
  files: FileEntity[] | number[]

  @OneToOne(() => FileEntity, file => file.createdByUser)
  @JoinColumn()
  profilePicture: FileEntity | number

}

export const userSearchableFields = [
  'email',
  'firstName',
  'lastName',
  'companyName',
  'siret',
  'subscription',
]
