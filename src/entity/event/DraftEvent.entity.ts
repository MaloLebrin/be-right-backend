import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, RelationId } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'
import { CompanyEntity } from '../Company.entity'
import type { EventCreationPayload } from '../../types/Event'
import EventEntity from '../EventEntity'

@Entity()
export class DraftEventEntity extends BaseEntity {
  @ManyToOne(() => CompanyEntity, company => company.draftEvents)
  company: CompanyEntity

  @RelationId((event: DraftEventEntity) => event.company)
  readonly companyId: number

  @OneToOne(() => EventEntity)
  @JoinColumn()
  event: EventEntity

  @RelationId((event: DraftEventEntity) => event.event)
  readonly eventId: number

  @Index()
  @Column({ nullable: false, unique: true })
  checkoutSessionId: string

  @Column({ nullable: false, type: 'json', default: '{}' })
  addressData: {
    addressLine: string
    addressLine2: null
    postalCode: string
    city: string
    country: string
  }

  @Column({ nullable: false, type: 'json', default: '{}' })
  eventData: EventCreationPayload & { photographerId: number }
}
