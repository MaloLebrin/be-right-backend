import { Column, Entity } from 'typeorm'
import { SubscriptionEnum } from '../types/Subscription'
import { BaseEntity } from './bases/BaseEntity'

@Entity()
export class SubscriptionEntity extends BaseEntity {
  @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
  type: SubscriptionEnum

  @Column({ nullable: true })
  expireAt: Date
}
