import type { DataSource, Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { wrapperRequest } from '../../utils'
import type { EventWithRelationsCreationPayload } from '../../types/Event'
import { ApiError } from '../../middlewares/ApiError'
import EventService from '../../services/EventService'
import { AddressService } from '../../services/AddressService'
import AnswerService from '../../services/AnswerService'
import { defaultQueue } from '../../jobs/queue/queue'
import { generateQueueName } from '../../jobs/queue/jobs/provider'
import { SendMailAnswerCreationjob } from '../../jobs/queue/jobs/sendMailAnswerCreation.job'
import { CreateEventNotificationsJob } from '../../jobs/queue/jobs/createNotifications.job'
import { UserEntity } from '../../entity/UserEntity'
import { NotificationTypeEnum } from '../../types'
import { isUserOwner } from '../../utils/userHelper'
import { UpdateEventStatusJob } from '../../jobs/queue/jobs/updateEventStatus.job'
import { EventDeleteService } from '../../services'
import { BaseAdminController } from './BaseAdminController'

export class AdminEventController extends BaseAdminController {
  private UserRepository: Repository<UserEntity>
  private EventService: EventService
  private EventDeleteService: EventDeleteService
  private AddressService: AddressService
  private AnswerService: AnswerService

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.UserRepository = SOURCE.getRepository(UserEntity)
    this.EventService = new EventService(SOURCE)
    this.EventDeleteService = new EventDeleteService(SOURCE)
    this.AddressService = new AddressService(SOURCE)
    this.AnswerService = new AnswerService(SOURCE)
  }

  public createOneForUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { event, address, photographerId, companyId }: EventWithRelationsCreationPayload & { companyId: number } = req.body

      if (!event || !address || !photographerId || !companyId) {
        throw new ApiError(422, 'Formulaire incomplet')
      }

      const newEvent = await this.EventService.createOneEvent(event, companyId, photographerId)

      if (!newEvent) {
        throw new ApiError(422, 'Une erreur s\'est produite lors la création de l\'événement')
      }

      const eventAddress = await this.AddressService.createOne({
        address,
        eventId: newEvent.id,
      })

      if (!eventAddress) {
        await this.EventDeleteService.softDeleteOneAndRelations(newEvent)
        throw new ApiError(422, 'Une erreur s\'est produite lors la création de l\'événement')
      }

      const answers = await this.AnswerService.createMany(newEvent.id, event.employeeIds)

      if (answers.length < 1) {
        await this.EventDeleteService.softDeleteOneAndRelations(newEvent)
        throw new ApiError(422, 'Une erreur s\'est produite lors la création de l\'événement')
      }

      const users = await this.UserRepository.find({
        where: {
          company: {
            id: companyId,
          },
        },
      })

      const owner = users.find(user => isUserOwner(user))

      if (!owner) {
        await this.EventDeleteService.softDeleteOneAndRelations(newEvent)
        throw new ApiError(422, 'Une erreur s\'est produite lors la création de l\'événement')
      }

      await defaultQueue.add(
        generateQueueName('SendMailAnswerCreationjob'),
        new SendMailAnswerCreationjob({
          answers,
          user: owner,
          event: newEvent,
        }),
      )

      await defaultQueue.add(
        generateQueueName('UpdateEventStatusJob'),
        new UpdateEventStatusJob({
          eventId: newEvent.id,
        }),
      )

      // FIXME Update this job with multiple userIds
      await Promise.all(users.map(user => defaultQueue.add(
        generateQueueName(NotificationTypeEnum.EVENT_CREATED),
        new CreateEventNotificationsJob({
          type: NotificationTypeEnum.EVENT_CREATED,
          event: newEvent,
          userId: user.id,
        })),
      ))

      return res.status(200).json({
        event: newEvent,
        answers,
        address: eventAddress,
      })
    })
  }
}
