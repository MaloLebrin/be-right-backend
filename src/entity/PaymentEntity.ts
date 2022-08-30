import { Column, Entity, OneToOne } from 'typeorm'
import { BaseEntity, SubscriptionEntitiy } from '.'

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

  @OneToOne(() => SubscriptionEntitiy, subscription => subscription.payment, { nullable: true })
  subscription: SubscriptionEntitiy
}

export enum PaymentStatusEnum {
  PAYMENT_STATUS_CREATED = 'PAYMENT_STATUS_CREATED',
  PAYMENT_STATUS_SUBMITTED = 'PAYMENT_STATUS_SUBMITTED',
  PAYMENT_STATUS_PAID = 'PAYMENT_STATUS_PAID',
  PAYMENT_STATUS_REJECTED = 'PAYMENT_STATUS_REJECTED',
}
