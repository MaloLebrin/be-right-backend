import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import type { EmployeeEntity } from '../../../entity/employees/EmployeeEntity'
import type { UserEntity } from '../../../entity/UserEntity'
import { logger } from '../../../middlewares/loggerService'
import { MailjetService } from '../../../services'
import type EventEntity from '../../../entity/EventEntity'
import { ApiError } from '../../../middlewares/ApiError'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

interface JobPayload {
  answers: AnswerEntity[]
  user: UserEntity
  event: EventEntity
}

export class SendMailAnswerCreationjob extends BaseJob implements JobImp {
  constructor(public payoad: Record<string, unknown>) {
    super()
  }

  handle = async () => {
    const mailjetService = new MailjetService(APP_SOURCE)

    const { answers, user, event } = this.payoad as unknown as JobPayload

    if (!event || !user || !event) {
      throw new ApiError(422, `Missing parametter job ${this.name}`)
    }

    if (answers?.length > 0 && user) {
      await Promise.all(answers.map(async answer => {
        if (!answer || !event) {
          logger.error(`Missing parametter job ${this.name}`)
          return
        }

        const employee = answer.employee as EmployeeEntity

        if (employee) {
          await mailjetService.sendEmployeeMail({
            answer,
            employee,
            event,
            creator: user,
          })
        }
      }))
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
