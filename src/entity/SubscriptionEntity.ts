import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
import { BaseEntity, PaymentEntity, UserEntity } from "."
import { SubscriptionEnum } from "../types/Subscription"

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
  payment: PaymentEntity | number
}
// TODO create subscription entity on creation account
