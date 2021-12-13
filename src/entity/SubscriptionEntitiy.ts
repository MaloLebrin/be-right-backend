import { BaseEntity } from "./BaseEntity";
import { Entity, Column, OneToMany, OneToOne, JoinColumn } from "typeorm"
import { SubscriptionEnum } from "../types/Subscription"
import { UserEntity } from "./UserEntity";
import { PaymentEntity } from "./PaymentEntity";

@Entity()
export class SubscriptionEntitiy extends BaseEntity {

    @Column({ type: 'enum', enum: SubscriptionEnum, default: SubscriptionEnum.BASIC })
    type: SubscriptionEnum

	@Column({ nullable: true })
	expireAt: Date

	@OneToOne(() => UserEntity, user => user.subscription)
	user: UserEntity
	
	@OneToOne(() => PaymentEntity, payment => payment.subscription)
	@JoinColumn({ name: 'paymentId', referencedColumnName: 'id' })
	payment: PaymentEntity

}
