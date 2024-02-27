import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import { logger } from '../../../middlewares/loggerService'
import EventService from '../../../services/EventService'
import { CompanyEntity } from '../../../entity/Company.entity'
import { EventStatusEnum } from '../../../types'
import { MailjetService } from '../../../services/MailjetService'
import { EventAndNotificationService } from '../../../services/EventAndNotificationService.service'
import { BaseJob } from './job.definition'
import type { JobImp } from './job.definition'

export class UpdateEventStatusJob extends BaseJob implements JobImp {
  constructor(public payoad: { eventId: number }) {
    super()
  }

  handle = async () => {
    const eventService = new EventService(APP_SOURCE)
    const { eventId } = this.payoad

    const {
      initialStatus,
      newStatus,
      event,
    } = await eventService.updateEventStatus(eventId)

    if (initialStatus !== newStatus && event) {
      if (newStatus === EventStatusEnum.COMPLETED) {
        const company = await APP_SOURCE.getRepository(CompanyEntity).findOne({
          where: {
            id: event.companyId,
          },
          relations: {
            users: true,
          },
        })

        if (company && company.users.length > 0) {
          const mailjetService = new MailjetService(APP_SOURCE)
          await mailjetService.sendEventCompletedEmail({
            event,
            users: company.users,
          })
        }
      }

      const eventAndNotificationService = new EventAndNotificationService(APP_SOURCE)
      await eventAndNotificationService.sendNotificationEventStatusChanged(event)
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
