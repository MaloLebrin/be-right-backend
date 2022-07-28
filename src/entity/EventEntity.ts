import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { EventStatusEnum } from '../types/Event'
import { BaseEntity } from './BaseEntity'
import { AddressEntity, FileEntity, UserEntity } from '.'

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

  @ManyToOne(() => UserEntity, user => user, { nullable: true })
  partner: UserEntity | number

  @RelationId((event: EventEntity) => event.partner)
  partnerId: number

  @ManyToOne(() => UserEntity, user => user.events, { onDelete: 'CASCADE' })
  @JoinColumn()
  createdByUser: UserEntity | number

  @OneToMany(() => FileEntity, file => file.event, { cascade: true })
  files: FileEntity[]

  @OneToOne(() => AddressEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  address: AddressEntity | number
}

export const eventSearchableFields = [
  'name',
]
