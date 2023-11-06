import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { EventStatusEnum } from '../types/Event'
import { AddressEntity } from './AddressEntity'
import { BaseEntity } from './bases/BaseEntity'
import { CompanyEntity } from './Company.entity'
import { FileEntity } from './FileEntity'
import { UserEntity } from './UserEntity'

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
  partner: UserEntity

  @RelationId((event: EventEntity) => event.partner)
  partnerId: number

  @ManyToOne(() => CompanyEntity, company => company.events)
  @JoinColumn()
  company: CompanyEntity

  @RelationId((event: EventEntity) => event.company)
  companyId: number

  @OneToMany(() => FileEntity, file => file.event, { orphanedRowAction: 'soft-delete' })
  files: FileEntity[]

  @RelationId((event: EventEntity) => event.files)
  filesIds: number[]

  @OneToOne(() => AddressEntity, { orphanedRowAction: 'delete', onDelete: 'SET NULL' })
  @JoinColumn()
  address: AddressEntity

  @RelationId((event: EventEntity) => event.address)
  addressId: number
}

export const eventSearchableFields = [
  'name',
]

export const eventRelationFields = [
  'company.name',
  'company.users.firstName',
  'company.users.lastName',
]
