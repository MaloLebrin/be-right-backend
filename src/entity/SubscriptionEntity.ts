import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { SubscriptionEnum } from '../types/Subscription'
import { BaseEntity } from './bases/BaseEntity'
import { PaymentEntity } from './PaymentEntity'

@Entity()
export class SubscriptionEntity extends BaseEntity {
  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
  type: SubscriptionEnum

  @Column({ nullable: true })
  expireAt: Date

  @OneToOne(() => PaymentEntity, payment => payment.subscription, { nullable: true })
  @JoinColumn()
  payment: PaymentEntity
  // FIXME can subscripiton have multiple payments ? YES!!!!!!!!!
  // REMOVE this use Stripe payments

  @RelationId((subscription: SubscriptionEntity) => subscription.payment)
  paymentId: number
}
