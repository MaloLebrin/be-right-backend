import AnswerEntity from "@/entity/AnswerEntity"
import AnswerService from "@/services/AnswerService"
import { Request, Response } from "express"
import { getManager } from "typeorm"


export default class AnswerController {

	public static createOne = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.eventId)
			const employeeId = parseInt(req.params.employeeId)
			const answer = AnswerService.createOne(eventId, employeeId)
			return answer ? res.status(200).json(answer) : res.status(400).json({ message: "no created" })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static createMany = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.eventId)
			const employeeIds = req.body.employeeIds
			const answers = AnswerService.createMany(eventId, employeeIds)
			return answers ? res.status(200).json(answers) : res.status(400).json({ message: "no created" })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static updateOne = async (req: Request, res: Response) => {
		try {
			const answer: AnswerEntity = req.body.answer
			const id = answer.id
			const answerUpdated = await AnswerService.updateOneAnswer(id, answer)
			return res.status(200).json(answerUpdated)
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static updateAnswerStatus = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.eventId)
			const employeeId = parseInt(req.params.employeeId)
			const isSigned = req.query.isSigned

			if (eventId && employeeId && isSigned !== undefined) {
				const answer = await AnswerService.getOneAnswerForEventEmployee(eventId, employeeId)
				if (answer) {
					answer.hasSigned = isSigned ? true : false
					answer.signedAt = new Date()
					await getManager().save(answer)
					return answer
				}
			} else {
				return res.status(400).json({ error: "Missing parametters" })
			}

		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

	public static deleteOne = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const answer = await AnswerService.deleteOne(id)
			return answer ? res.status(200).json(answer) : res.status(400).json({ message: "no deleted" })
		} catch (error) {
			return res.status(error.status).json({ error: error.message })
		}
	}

}