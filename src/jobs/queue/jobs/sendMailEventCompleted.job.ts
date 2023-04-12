import type { Job } from 'bullmq'
import type EventEntity from '../../../entity/EventEntity'
import { logger } from '../../../middlewares/loggerService'
import { EventStatusEnum } from '../../../types'
import { MailjetService } from '../../../services/MailjetService'
import { APP_SOURCE } from '../../..'
import { CompanyEntity } from '../../../entity/Company.entity'
import { BaseJob } from './job.definition'
import type { JobImp } from './job.definition'

export class SendMailEventCompletedJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    event: EventEntity
  }) {
    super()
  }

  handle = async () => {
    const {
      event,
    } = this.payoad

    if (event.status === EventStatusEnum.COMPLETED) {
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
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
