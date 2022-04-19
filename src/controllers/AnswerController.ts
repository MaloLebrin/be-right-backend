import AnswerEntity from "../entity/AnswerEntity"
import AnswerService from "../services/AnswerService"
import { Request, Response } from "express"
import { getManager } from "typeorm"
import EventService from "../services/EventService"

export default class AnswerController {

  public static createOne = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.query.eventId.toString())
      const employeeId = parseInt(req.query.employeeId.toString())
      const answer = AnswerService.createOne(eventId, employeeId)
      const event = await EventService.getOneEvent(eventId)
      if (event) {
        await EventService.multipleUpdateForEvent(event)
      }
      return answer ? res.status(200).json(answer) : res.status(400).json({ message: "no created" })
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }

  public static createMany = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds
      const answers = AnswerService.createMany(eventId, employeeIds)
      const event = await EventService.getOneEvent(eventId)
      if (event) {
        await EventService.multipleUpdateForEvent(event)
      }
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
      const event = await EventService.getOneEvent(answer.event)
      if (event) {
        await EventService.multipleUpdateForEvent(event)
      }
      return res.status(200).json(answerUpdated)
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }

  public static updateAnswerStatus = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.body.eventId)
      const employeeId = parseInt(req.body.employeeId)
      const isSigned = req.query.isSigned

      if (eventId && employeeId && isSigned !== undefined) {
        const answer = await AnswerService.getOneAnswerForEventEmployee(eventId, employeeId)
        if (answer) {
          answer.hasSigned = isSigned ? true : false
          answer.signedAt = new Date()
          await getManager().save(answer)
          const event = await EventService.getOneEvent(answer.event)
          if (event) {
            await EventService.multipleUpdateForEvent(event)
          }
          return res.status(200).json(answer)
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
      const answerToDelete = await AnswerService.getOne(id)
      const answer = await AnswerService.deleteOne(id)
      const event = await EventService.getOneEvent(answerToDelete.event)
      if (event) {
        await EventService.multipleUpdateForEvent(event)
      }
      return answer ? res.status(200).json(answer) : res.status(400).json({ message: "no deleted" })
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }
}
