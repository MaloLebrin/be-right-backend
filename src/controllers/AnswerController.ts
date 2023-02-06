import type { Request, Response } from 'express'
import { wrapperRequest } from '../utils'
import type AnswerEntity from '../entity/AnswerEntity'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { APP_SOURCE, REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import { ApiError } from '../middlewares/ApiError'

export default class AnswerController {
  AnswerService: AnswerService
  EventService: EventService
  redisCache: RedisCache

  constructor() {
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.redisCache = REDIS_CACHE
  }

  private saveAnswerInCache = async (answer: AnswerEntity) => {
    await this.redisCache.save(`answer-id-${answer.id}`, answer)
  }

  private saveManyAnswerInCache = async (answers: AnswerEntity[]) => {
    await this.redisCache.multiSave({
      payload: answers,
      typeofEntity: EntitiesEnum.ANSWER,
      objKey: 'id',
    })
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.query.eventId.toString())
      const employeeId = parseInt(req.query.employeeId.toString())

      const answer = await this.AnswerService.createOne(eventId, employeeId)
      await this.saveAnswerInCache(answer)

      await this.EventService.multipleUpdateForEvent(eventId)

      if (answer) {
        return res.status(200).json(answer)
      }

      throw new ApiError(422, 'Destinataire non lié avec l\'événement').Handler(res)
    })
  }

  public createMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds

      const answers = await this.AnswerService.createMany(eventId, employeeIds)
      await this.saveManyAnswerInCache(answers)

      await this.EventService.multipleUpdateForEvent(eventId)

      if (answers && answers.length > 0) {
        return res.status(200).json(answers)
      }
      throw new ApiError(422, 'Destinataires non liés avec l\'événement').Handler(res)
    })
  }

  public getManyForEvent = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answers = await this.AnswerService.getAllAnswersForEvent(id, false)
        return res.status(200).json(answers)
      }

      throw new ApiError(422, 'Identifiant de l\'événement manquant').Handler(res)
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      if (ids) {
        const answerIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))

        if (answerIds?.length > 0) {
          const answers = await this.redisCache.getMany<AnswerEntity>({
            keys: generateRedisKeysArray({
              field: 'id',
              typeofEntity: EntitiesEnum.ANSWER,
              ids: answerIds,
            }),
            typeofEntity: EntitiesEnum.ANSWER,
            fetcher: () => this.AnswerService.getMany(answerIds),
          })

          return res.status(200).json(answers)
        }
      }
      throw new ApiError(422, 'Identifiants manquants').Handler(res)
    })
  }

  public getManyForManyEvents = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      if (ids) {
        const eventIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))

        if (eventIds?.length > 0) {
          const answers = await this.redisCache.getMany<AnswerEntity>({
            keys: generateRedisKeysArray({
              field: 'id',
              typeofEntity: EntitiesEnum.ANSWER,
              ids: eventIds,
            }),
            typeofEntity: EntitiesEnum.ANSWER,
            fetcher: () => this.AnswerService.getAnswersForManyEvents(eventIds),
          })

          return res.status(200).json(answers)
        }
      }
      throw new ApiError(422, 'Identifiants des événements manquant').Handler(res)
    })
  }

  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const answer: AnswerEntity = req.body.answer
      const id = answer.id
      const answerUpdated = await this.AnswerService.updateOneAnswer(id, answer)

      await this.saveAnswerInCache(answerUpdated)

      await this.EventService.multipleUpdateForEvent(answerUpdated.event)
      return res.status(200).json(answerUpdated)
    })
  }

  public updateAnswerStatus = async (req: Request, res: Response) => {
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

          await this.saveAnswerInCache(answer)

          await this.EventService.multipleUpdateForEvent(answer.event)
          return res.status(200).json(answer)
        }
      }
      throw new ApiError(422, 'Paramètres manquants').Handler(res)
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answerToDelete = await this.AnswerService.getOne(id)
        const answer = await this.AnswerService.deleteOne(id)

        await this.redisCache.invalidate(generateRedisKey({
          field: 'id',
          typeofEntity: EntitiesEnum.ANSWER,
          id,
        }))

        await this.EventService.multipleUpdateForEvent(answerToDelete.event)
        return res.status(200).json(answer)
      }
      throw new ApiError(422, 'Identifiant de l\'événement manquant').Handler(res)
    })
  }
}
