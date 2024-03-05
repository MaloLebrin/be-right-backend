import type { DataSource } from 'typeorm'
import type { UserEntity } from '../../entity/UserEntity'
import { CreateEventNotificationsJob } from '../../jobs/queue/jobs/createNotifications.job'
import { generateQueueName } from '../../jobs/queue/jobs/provider'
import { SendMailAnswerCreationjob } from '../../jobs/queue/jobs/sendMailAnswerCreation.job'
import { defaultQueue } from '../../jobs/queue/queue'
import { type EventCreationPayload, NotificationTypeEnum } from '../../types'
import { AddressService } from '../AddressService'
import AnswerService from '../AnswerService'
import EventService from '../EventService'
import RedisService from '../RedisService'

export class EventCreateService {
  private EventService: EventService
  private AddressService: AddressService
  private AnswerService: AnswerService
  private RediceService: RedisService

  constructor(APP_SOURCE: DataSource) {
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.RediceService = new RedisService(APP_SOURCE)
  }

  public createEventWithRelations = async ({
    event,
    address,
    companyId,
    photographerId,
    user,
  }: {
    event: EventCreationPayload
    address: {
      addressLine: string
      addressLine2: null
      postalCode: string
      city: string
      country: string
    }
    companyId: number
    photographerId: number
    user: UserEntity
  }) => {
    const newEvent = await this.EventService.createOneEvent(event, companyId, photographerId)

    if (newEvent && address) {
      await defaultQueue.add(
        generateQueueName(NotificationTypeEnum.EVENT_CREATED),
        new CreateEventNotificationsJob({
          type: NotificationTypeEnum.EVENT_CREATED,
          event: newEvent,
          userId: user.id,
        }))

      const [addressCreated, answers] = await Promise.all([
        this.AddressService.createOne({
          address,
          eventId: newEvent.id,
        }),
        this.AnswerService.createMany(newEvent.id, event.employeeIds),
        this.RediceService.updateCurrentUserInCache({ userId: user.id }),
      ])

      await this.EventService.updateEventStatus(newEvent.id)

      if (answers.length > 0) {
        await defaultQueue.add(
          generateQueueName('SendMailAnswerCreationjob'),
          new SendMailAnswerCreationjob({
            answers,
            user,
            event: newEvent,
          }),
        )
      }

      return {
        event: newEvent,
        answers,
        address: addressCreated,
      }
    }
  }
}
