import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'
import { CompanyEntity } from '../Company.entity'
import type { EventCreationPayload } from '../../types/Event'

@Entity()
export class DraftEventEntity extends BaseEntity {
  @ManyToOne(() => CompanyEntity, company => company.draftEvents)
  company: CompanyEntity

  @RelationId((event: DraftEventEntity) => event.company)
  readonly companyId: number

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
