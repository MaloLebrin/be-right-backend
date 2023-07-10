import type { Job } from 'bullmq'
import { logger } from '../../../middlewares/loggerService'
import type { UserEntity } from '../../../entity/UserEntity'
import type { CompanyEntity } from '../../../entity/Company.entity'
import { MailjetService } from '../../../services/MailjetService'
import { APP_SOURCE } from '../../..'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class SendMailUserOnAccountJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    newUser: UserEntity
    creator: UserEntity
    company: CompanyEntity
  }) {
    super()
  }

  handle = async () => {
    const {
      newUser,
      creator,
      company,
    } = this.payoad

    const mailjetService = new MailjetService(APP_SOURCE)

    await mailjetService.sendMailewUserOnAccount({
      newUser,
      creator,
      company,
    })
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
