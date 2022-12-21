import type { Request, Response } from 'express'
import { wrapperRequest } from '../utils'
import type AnswerEntity from '../entity/AnswerEntity'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { APP_SOURCE } from '..'

export default class AnswerController {
  public static createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.query.eventId.toString())
      const employeeId = parseInt(req.query.employeeId.toString())
      const answer = AnswerService.createOne(eventId, employeeId)
      await EventService.multipleUpdateForEvent(eventId)
      return answer ? res.status(200).json(answer) : res.status(400).json({ message: 'no created' })
    })
  }

  public static createMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds
      const answers = AnswerService.createMany(eventId, employeeIds)
      await EventService.multipleUpdateForEvent(eventId)
      return answers ? res.status(200).json(answers) : res.status(400).json({ message: 'no created' })
    })
  }

  public static getManyForEvent = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answers = await AnswerService.getAllAnswersForEvent(id, false)
        return res.status(200).json(answers)
      }
      return res.status(400).json({ message: 'no id' })
    })
  }

  public static updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const answer: AnswerEntity = req.body.answer
      const id = answer.id
      const answerUpdated = await AnswerService.updateOneAnswer(id, answer)
      await EventService.multipleUpdateForEvent(answerUpdated.event)
      return res.status(200).json(answerUpdated)
    })
  }

  public static updateAnswerStatus = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeId = parseInt(req.body.employeeId)
      const isSigned = req.query.isSigned

      if (eventId && employeeId && isSigned !== undefined) {
        const answer = await AnswerService.getOneAnswerForEventEmployee(eventId, employeeId)
        if (answer) {
          answer.hasSigned = !!isSigned
          answer.signedAt = new Date()
          await APP_SOURCE.manager.save(answer)
          await EventService.multipleUpdateForEvent(answer.event)
          return res.status(200).json(answer)
        }
      }
      return res.status(400).json({ error: 'Missing parametters' })
    })
  }

  public static deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answerToDelete = await AnswerService.getOne(id)
        const answer = await AnswerService.deleteOne(id)
        await EventService.multipleUpdateForEvent(answerToDelete.event)
        return res.status(200).json(answer)
      }
      return res.status(422).json({ message: 'no id' })
    })
  }
}
