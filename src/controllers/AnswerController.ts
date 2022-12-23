import type { Request, Response } from 'express'
import { wrapperRequest } from '../utils'
import type AnswerEntity from '../entity/AnswerEntity'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { APP_SOURCE } from '..'

export default class AnswerController {
  AnswerService: AnswerService
  EventService: EventService

  constructor() {
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
  }

  async createOne(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.query.eventId.toString())
      const employeeId = parseInt(req.query.employeeId.toString())
      const answer = this.AnswerService.createOne(eventId, employeeId)
      await this.EventService.multipleUpdateForEvent(eventId)
      return answer ? res.status(200).json(answer) : res.status(400).json({ message: 'no created' })
    })
  }

  async createMany(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds
      const answers = this.AnswerService.createMany(eventId, employeeIds)
      await this.EventService.multipleUpdateForEvent(eventId)
      return answers ? res.status(200).json(answers) : res.status(400).json({ message: 'no created' })
    })
  }

  async getManyForEvent(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answers = await this.AnswerService.getAllAnswersForEvent(id, false)
        return res.status(200).json(answers)
      }
      return res.status(400).json({ message: 'no id' })
    })
  }

  async updateOne(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const answer: AnswerEntity = req.body.answer
      const id = answer.id
      const answerUpdated = await this.AnswerService.updateOneAnswer(id, answer)
      await this.EventService.multipleUpdateForEvent(answerUpdated.event)
      return res.status(200).json(answerUpdated)
    })
  }

  async updateAnswerStatus(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeId = parseInt(req.body.employeeId)
      const isSigned = req.query.isSigned

      if (eventId && employeeId && isSigned !== undefined) {
        const answer = await this.AnswerService.getOneAnswerForEventEmployee(eventId, employeeId)
        if (answer) {
          answer.hasSigned = !!isSigned
          answer.signedAt = new Date()
          await APP_SOURCE.manager.save(answer)
          await this.EventService.multipleUpdateForEvent(answer.event)
          return res.status(200).json(answer)
        }
      }
      return res.status(400).json({ error: 'Missing parametters' })
    })
  }

  async deleteOne(req: Request, res: Response) {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answerToDelete = await this.AnswerService.getOne(id)
        const answer = await this.AnswerService.deleteOne(id)
        await this.EventService.multipleUpdateForEvent(answerToDelete.event)
        return res.status(200).json(answer)
      }
      return res.status(422).json({ message: 'no id' })
    })
  }
}
