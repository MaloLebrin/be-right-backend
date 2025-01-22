import type { NextFunction, Request, Response } from 'express'
import type { DataSource, Repository } from 'typeorm'
import { wrapperRequest } from '../utils'
import AnswerEntity from '../entity/AnswerEntity'
import AnswerService from '../services/AnswerService'
import { EventService } from '../services/event/EventService'
import { REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { generateRedisKey, generateRedisKeysArray } from '../utils/redisHelper'
import { ApiError } from '../middlewares/ApiError'
import { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { MailjetService } from '../services'
import { defaultQueue } from '../jobs/queue/queue'
import { UpdateEventStatusJob } from '../jobs/queue/jobs/updateEventStatus.job'
import { SendMailAnswerCreationjob } from '../jobs/queue/jobs/sendMailAnswerCreation.job'
import { isUserOwner } from '../utils/userHelper'
import { answerResponse, isAnswerSigned } from '../utils/answerHelper'
import { CompanyEntity } from '../entity/Company.entity'
import { generateQueueName } from '../jobs/queue/jobs/provider'

export class AnswerController {
  private AnswerService: AnswerService
  private EventService: EventService
  private mailJetService: MailjetService
  private redisCache: RedisCache
  private employeeRepository: Repository<EmployeeEntity>
  private companyRepository: Repository<CompanyEntity>
  private repository: Repository<AnswerEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.mailJetService = new MailjetService(DATA_SOURCE)
      this.employeeRepository = DATA_SOURCE.getRepository(EmployeeEntity)
      this.companyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.redisCache = REDIS_CACHE
      this.repository = DATA_SOURCE.getRepository(AnswerEntity)
    }
  }

  private saveAnswerInCache = async (answer: AnswerEntity) => {
    await this.redisCache.save(`answer-id-${answer.id}`, answerResponse(answer))
  }

  private saveManyAnswerInCache = async (answers: AnswerEntity[]) => {
    await this.redisCache.multiSave({
      payload: this.AnswerService.filterSecretAnswersKeys(answers),
      typeofEntity: EntitiesEnum.ANSWER,
      objKey: 'id',
    })
  }

  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const eventId = parseInt(req.query.eventId.toString())
      const employeeId = parseInt(req.query.employeeId.toString())

      const answer = await this.AnswerService.createOne(eventId, employeeId)
      await this.saveAnswerInCache(answer)

      const [event, employee] = await Promise.all([
        this.EventService.getOneEvent(eventId),
        this.employeeRepository.findOne({
          where: {
            id: employeeId,
          },
        }),
      ])

      await defaultQueue.add(
        generateQueueName('UpdateEventStatusJob'),
        new UpdateEventStatusJob({
          eventId,
        }),
      )

      if (employee && event) {
        await defaultQueue.add(
          generateQueueName('SendMailAnswerCreationjob'),
          new SendMailAnswerCreationjob({
            answers: [{
              ...answer,
              employee,
            }],
            user: ctx.user,
          }),
        )
      }

      if (answer) {
        return res.status(200).json(answerResponse(answer))
      }

      throw new ApiError(422, 'Destinataire non lié avec l\'événement')
    })
  }

  public createMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const answers = await this.AnswerService.createMany(eventId, employeeIds)
      await this.saveManyAnswerInCache(answers)

      const answersToSendMail = await this.AnswerService.getMany(answers.map(ans => ans.id), true)
      const event = await this.EventService.getOneEvent(eventId)

      if (answersToSendMail.length > 0 && event) {
        await defaultQueue.add(
          generateQueueName('SendMailAnswerCreationjob'),
          new SendMailAnswerCreationjob({
            answers: answersToSendMail,
            user: ctx.user,
          }),
        )
      }

      await defaultQueue.add(
        generateQueueName('UpdateEventStatusJob'),
        new UpdateEventStatusJob({
          eventId,
        }),
      )

      if (answers && answers.length > 0) {
        return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
      }
      throw new ApiError(422, 'Destinataires non liés avec l\'événement')
    })
  }

  public getManyForEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const answers = await this.AnswerService.getAllAnswersForEvent(id)
        return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
      }

      throw new ApiError(422, 'Identifiant de l\'événement manquant')
    })
  }

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

          return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
        }
      }
      throw new ApiError(422, 'Identifiants manquants')
    })
  }

  public getManyForManyEvents = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

          return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
        }
      }
      throw new ApiError(422, 'Identifiants des événements manquant')
    })
  }

  public getManyByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const employeeId = parseInt(req.params.id)

      if (!employeeId) {
        throw new ApiError(422, 'Identifiant de la réponse manquant')
      }

      const answers = await this.AnswerService.getAllAnswersForEmployee(employeeId)
      return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
    })
  }

  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const answer: AnswerEntity = req.body.answer
      const id = answer.id
      const answerUpdated = await this.AnswerService.updateOneAnswer(id, answer)

      await Promise.all([
        this.saveAnswerInCache(answerUpdated),
        this.EventService.updateEventStatus(answerUpdated.eventId),
      ])

      return res.status(200).json(answerResponse(answerUpdated))
    })
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'Identifiant de la réponse manquant')
      }

      const answerToDelete = await this.AnswerService.getOne(id)

      if (!answerToDelete) {
        throw new ApiError(422, 'Identifiant de la réposnse manquant')
      }
      const [answer] = await Promise.all([
        this.AnswerService.deleteOne(id),
        this.redisCache.invalidate(generateRedisKey({
          field: 'id',
          typeofEntity: EntitiesEnum.ANSWER,
          id,
        })),
      ])

      await this.EventService.updateEventStatus(answerToDelete.eventId)
      return res.status(200).json(answer)
    })
  }

  public raiseAnswer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'Identifiant de l\'événement manquant')
      }

      const answer = await this.AnswerService.getOne(id, true)

      if (!answer || !answer.employee || !answer.event) {
        throw new ApiError(422, 'Le destinataire ne participe pas à cet événement')
      }

      if (isAnswerSigned(answer)) {
        throw new ApiError(422, 'Le destinataire à déja répondu')
      }

      const company = await this.companyRepository.findOne({
        where: {
          id: answer.event.companyId,
        },
        relations: {
          users: true,
        },
      })

      if (!company) {
        throw new ApiError(422, 'Un problème est survenu')
      }
      const owner = company.users?.find(user => isUserOwner(user))

      if (!owner) {
        throw new ApiError(422, 'Un problème est survenu')
      }

      await Promise.all([
        this.mailJetService.sendRaiseAnswerEmail({
          event: answer.event,
          employee: answer.employee,
          owner,
          answer,
        }),
        this.repository.update(answer.id, { mailSendAt: new Date() }),
      ])

      const answerToSend = await this.AnswerService.getOne(id)

      return res.status(200).json({
        message: 'Le destinataire a été relancé',
        isSuccess: true,
        answer: answerResponse(answerToSend),
      })
    })
  }
}
