import type { PaymentEntity, SubscriptionEntitiy, UserEntity } from '../entity'

export enum SubscriptionEnum {
  PREMIUM = 'PREMIUM',
  MEDIUM = 'MEDIUM',
  BASIC = 'BASIC',
}

export interface SubscriptionWithRelations extends SubscriptionEntitiy {
  user: UserEntity
  payment: PaymentEntity | null
}
