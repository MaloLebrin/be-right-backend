import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'
import { SubscriptionEntity } from './SubscriptionEntity'

@Entity()
export class PaymentEntity extends BaseEntity {
  @Column({ default: 0 })
  amount: number

  @Column({ default: 'eur' })
  currency: string

  @Column({ nullable: true })
  submittedAt: Date

  @Column({ nullable: true })
  executedAt: Date

  @OneToOne(() => SubscriptionEntity, subscription => subscription.payment, { nullable: true })
  @JoinColumn()
  subscription: SubscriptionEntity

  @RelationId((payment: PaymentEntity) => payment.subscription)
  subscriptionId: number
}

export enum PaymentStatusEnum {
  PAYMENT_STATUS_CREATED = 'PAYMENT_STATUS_CREATED',
  PAYMENT_STATUS_SUBMITTED = 'PAYMENT_STATUS_SUBMITTED',
  PAYMENT_STATUS_PAID = 'PAYMENT_STATUS_PAID',
  PAYMENT_STATUS_REJECTED = 'PAYMENT_STATUS_REJECTED',
}
