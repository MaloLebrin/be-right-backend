import { CurrencyEnum, PaymentStatusEnum } from "../types/Payment"
import { Entity, Column, OneToOne } from "typeorm"
import { BaseEntity, SubscriptionEntitiy } from "."

@Entity()
export class PaymentEntity extends BaseEntity {

  @Column({ default: 0 })
  amount: number

  @Column({ type: 'enum', enum: CurrencyEnum, default: CurrencyEnum.EUR }) // TODO add enum
  currency: CurrencyEnum

  @Column({ type: 'enum', enum: PaymentStatusEnum, default: PaymentStatusEnum.PAYMENT_STATUS_CREATED }) // TODO add enum
  status: PaymentStatusEnum

  @Column({ nullable: true })
  submittedAt: Date

  @Column({ nullable: true })
  executedAt: Date

  @OneToOne(() => SubscriptionEntitiy, subscription => subscription.payment, { nullable: true })
  subscription: SubscriptionEntitiy

}
