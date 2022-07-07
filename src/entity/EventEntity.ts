import { BaseEntity, Column, Entity, ManyToOne, OneToMany } from "typeorm"
import { UserEntity, AddressEntity, FileEntity } from "."
import { EventStatusEnum } from "../types/Event"

@Entity()
export default class EventEntity extends BaseEntity {

  @Column()
  name: string

  @Column()
  start: Date

  @Column()
  end: Date

  @Column({ nullable: true })
  description: string

  @Column({ type: 'enum', enum: EventStatusEnum, default: EventStatusEnum.CREATE })
  status: EventStatusEnum

  @Column({ default: 0 })
  signatureCount: number

  @Column({ default: 0 })
  totalSignatureNeeded: number

  @ManyToOne(() => UserEntity, user => user.events, { nullable: true })
  partner: UserEntity | number

  @ManyToOne(() => UserEntity, user => user.events, { onDelete: 'CASCADE' })
  createdByUser: UserEntity | number

  @OneToMany(() => FileEntity, file => file.event, { cascade: true })
  files: FileEntity[]

  @OneToMany(() => AddressEntity, address => address.event, { cascade: true })
  address: AddressEntity[] | number[]

}

export const eventSearchableFields = [
  'name',
  'address',
  'city',
]
