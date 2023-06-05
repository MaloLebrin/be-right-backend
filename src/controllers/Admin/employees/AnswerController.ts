import type { DataSource, Repository } from 'typeorm'
import type { Request, Response } from 'express'
import { BaseAdminController } from '../BaseAdminController'
import { UserEntity } from '../../../entity/UserEntity'
import { generateQueueName } from '../../../jobs/queue/jobs/provider'
import { SendMailAnswerCreationjob } from '../../../jobs/queue/jobs/sendMailAnswerCreation.job'
import { UpdateEventStatusJob } from '../../../jobs/queue/jobs/updateEventStatus.job'
import { defaultQueue } from '../../../jobs/queue/queue'
import { ApiError } from '../../../middlewares/ApiError'
import AnswerService from '../../../services/AnswerService'
import EventService from '../../../services/EventService'
import { wrapperRequest } from '../../../utils'

export class AdminAnswerController extends BaseAdminController {
  private UserRepository: Repository<UserEntity>
  private EventService: EventService
  private AnswerService: AnswerService

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.UserRepository = SOURCE.getRepository(UserEntity)
    this.EventService = new EventService(SOURCE)
    this.AnswerService = new AnswerService(SOURCE)
  }

  public createMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.body.eventId)
      const employeeIds = req.body.employeeIds
      const userId = req.body.userId

      if (!userId || !eventId || employeeIds?.length < 1) {
        throw new ApiError(422, 'Identifiants manquants')
      }

      const answers = await this.AnswerService.createMany(eventId, employeeIds)

      const answersToSendMail = await this.AnswerService.getMany(answers.map(ans => ans.id), true)
      const event = await this.EventService.getOneEvent(eventId)

      const user = await this.UserRepository.findOneBy({ id: userId })

      if (!user || answersToSendMail.length < 1 || !event) {
        throw new ApiError(422, 'Une erreur est survenue')
      }

      await defaultQueue.add(
        generateQueueName('SendMailAnswerCreationjob'),
        new SendMailAnswerCreationjob({
          answers: answersToSendMail,
          user,
        }),
      )

      await defaultQueue.add(
        generateQueueName('UpdateEventStatusJob'),
        new UpdateEventStatusJob({
          eventId,
        }),
      )

      return res.status(200).json(this.AnswerService.filterSecretAnswersKeys(answers))
    })
  }
}
