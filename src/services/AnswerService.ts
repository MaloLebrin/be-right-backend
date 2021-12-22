import AnswerEntity from "../entity/AnswerEntity"
import { getManager } from "typeorm"

export default class AnswerService {

	public static createOne = async (eventId: number, employeeId: number) => {
		const newAnswer = getManager().create(AnswerEntity, {
			event: eventId,
			employee: employeeId,
		})
		await getManager().save(newAnswer)
		return newAnswer
	}

	public static createMany = async (eventId: number, employeeIds: number[]) => {
		const newAnswers = employeeIds.map(employeeId => getManager().create(AnswerEntity, {
			event: eventId,
			employee: employeeId,
		}))
		await getManager().save(newAnswers)
		return newAnswers
	}

	public static getOneAnswerForEventEmployee = async (eventId: number, employeeId: number) => {
		return await getManager().findOne(AnswerEntity, {
			where: {
				event: eventId,
				employee: employeeId,
			},
			relations: ["employee"],
		})
	}

	public static getAllAnswersForEvent = async (eventId: number) => {
		return await getManager().find(AnswerEntity, {
			where: {
				event: eventId,
			},
			relations: ["employee"],
		})
	}


	public static getAllAnswersForEmployee = async (employeeId: number) => {
		return await getManager().find(AnswerEntity, {
			where: {
				employee: employeeId,
			},
			relations: ["employee", "event"],
		})
	}

	public static updateOneAnswer = async (id: number, answer: AnswerEntity) => {
		const answerToUpdate = await getManager().findOne(AnswerEntity, id)
		const updatedAnswer = {
			...answerToUpdate,
			signedAt: new Date(),
			hasSigned: answer.hasSigned,
			reason: answer.reason,
		}
		await getManager().save(updatedAnswer)
		return updatedAnswer
	}

	public static deleteOne = async (id: number) => {
		const deleted = await getManager().delete(AnswerEntity, id)
		return deleted
	}
}