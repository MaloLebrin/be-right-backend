import AnswerEntity from "../entity/AnswerEntity"
import EventEntity from "../entity/EventEntity"
import { getManager } from "typeorm"
import { UserEntity } from "../entity/UserEntity"

export default class EventService {

	public static async updateEventSignatureNeeded(eventId: number, signatureNeeded: number) {
		const event = await getManager().findOne(EventEntity, eventId)
		event.totalSignatureNeeded = signatureNeeded
		await getManager().save(event)
		return this.getOneEvent(eventId)
	}

	public static getNumberSignatureNeededForEvent = async (eventId: number) => {
		const answers = await getManager().find(AnswerEntity, {
			where: {
				event: eventId,
			},
			relations: ["employee"],
		})
		const totalSignatureNeeded = answers.length
		await getManager().update(EventEntity, eventId, { totalSignatureNeeded, updatedAt: new Date() })
		return this.getOneEvent(eventId)
	}


	public static async getOneEvent(eventId: number) {
		const finded = await getManager().findOne(EventEntity, eventId, { relations: ["createdByUser"] })
		const user = finded.createdByUser as UserEntity
		return {
			...finded,
			createdByUser: user.id,
		}
	}

}