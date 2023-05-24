import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { MoreThan } from 'typeorm'
import dayjs from 'dayjs'
import { wrapperRequest } from '../../utils'
import { isUserAdmin } from '../../utils/userHelper'
import { ApiError } from '../../middlewares/ApiError'
import Context from '../../context'
import AnswerEntity from '../../entity/AnswerEntity'
import EventEntity from '../../entity/EventEntity'
import { APP_SOURCE } from '../..'
import { EventStatusEnum } from '../../types'

export class AdminStatsController {
  private AnswerRepository: Repository<AnswerEntity>
  private EventRepository: Repository<EventEntity>

  constructor() {
    this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
    this.EventRepository = APP_SOURCE.getRepository(EventEntity)
  }

  public statsHome = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      if (!isUserAdmin(ctx.user)) {
        throw new ApiError(401, 'Action non authorisée')
      }

      const yearAgoDate = dayjs().locale('fr').subtract(1, 'year')

      const [answers, total] = await this.AnswerRepository.findAndCount({
        where: {
          createdAt: MoreThan(yearAgoDate.toDate()),
        },
      })

      const [events, eventTotal] = await this.EventRepository.findAndCount({
        where: {
          createdAt: MoreThan(yearAgoDate.toDate()),
        },
      })

      return res.status(200).json({
        answers: {
          total,
          refused: answers.filter(answer => !answer.hasSigned && answer.signedAt).length,
          accepted: answers.filter(answer => answer.hasSigned && answer.signedAt).length,
          withoutResponse: answers.filter(answer => !answer.hasSigned && !answer.signedAt).length,
        },

        events: {
          total: eventTotal,
          completed: events.filter(event => event.status === EventStatusEnum.COMPLETED).length,
          closed: events.filter(event => event.status === EventStatusEnum.CLOSED).length,
          created: events.filter(event => event.status === EventStatusEnum.CREATE).length,
          pending: events.filter(event => event.status === EventStatusEnum.PENDING).length,
        },
      })
    })
  }
}
