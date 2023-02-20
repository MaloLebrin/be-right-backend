import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import type { EmployeeEntity } from '../../../entity/EmployeeEntity'
import type { UserEntity } from '../../../entity/UserEntity'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import { firtSendAnswerTemplate } from '../../../utils/mailJetHelpers'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

interface JobPayload {
  answers: AnswerEntity[]
  user: UserEntity
}

export class SendMailAnswerCreationjob extends BaseJob implements JobImp {
  constructor(public payoad: JobPayload) {
    super()
  }

  handle = async () => {
    const mailjetService = new MailjetService(APP_SOURCE)

    const { answers, user } = this.payoad

    if (answers?.length > 0 && user) {
      await Promise.all(answers.map(async answer => {
        if (!answer) {
          return
        }

        const employee = answer.employee as EmployeeEntity

        if (employee) {
          await mailjetService.sendEmployeeMail({
            answer,
            employee,
            template: firtSendAnswerTemplate({
              employee,
              creator: user,
            }),
          })
        }
      }))
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
