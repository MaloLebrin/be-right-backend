import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { SubscriptionEnum } from '../types/Subscription'
import { BaseEntity, PaymentEntity, UserEntity } from '.'

@Entity()
export class SubscriptionEntitiy extends BaseEntity {
  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
  type: SubscriptionEnum

  @Column({ nullable: true })
  expireAt: Date

  @OneToOne(() => UserEntity, user => user.subscription)
  user: UserEntity | number

  @OneToOne(() => PaymentEntity, payment => payment.subscription, { nullable: true })
  @JoinColumn({ name: 'paymentId', referencedColumnName: 'id' })
  payment: PaymentEntity
}
