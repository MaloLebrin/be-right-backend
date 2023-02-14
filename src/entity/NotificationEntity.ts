import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { NotificationTypeEnum } from '../types'
import { BaseEntity } from './BaseEntity'
import { NotificationSubcriptionEntity } from './NotificationSubcriptionEntity'

@Entity()
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationTypeEnum, default: NotificationTypeEnum.ANSWER_RESPONSE })
  type: NotificationTypeEnum

  @ManyToOne(() => NotificationSubcriptionEntity, subscriber => subscriber.notifications)
  subscriber: NotificationSubcriptionEntity

  @RelationId((employee: NotificationEntity) => employee.subscriber)
  subscriberId: number
}
