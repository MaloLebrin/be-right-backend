import { getManager } from "typeorm"
import { PaymentEntity } from "../entity"

export class PaymentService {

	async createOne(payment: PaymentEntity): Promise<PaymentEntity> {
		const newPayment = getManager().create(PaymentEntity, payment)
		await getManager().save(newPayment)
		return newPayment
	}
}