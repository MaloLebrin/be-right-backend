import type { Request, Response } from 'express'
import type { DataSource, Repository } from 'typeorm'
import { MoreThan } from 'typeorm'
import dayjs from 'dayjs'
import { wrapperRequest } from '../../utils'
import { isSimplyUser, isUserAdmin, isUserOwner, isUserPhotographer } from '../../utils/userHelper'
import { ApiError } from '../../middlewares/ApiError'
import Context from '../../context'
import AnswerEntity from '../../entity/AnswerEntity'
import EventEntity from '../../entity/EventEntity'
import { EventStatusEnum } from '../../types'
import { UserEntity } from '../../entity/UserEntity'
import { uniqByKey } from '../../utils/arrayHelper'
import { isBasicCie, isMediumCie, isPremiumCie } from '../../utils/companyHelper'

export class AdminStatsController {
  private AnswerRepository: Repository<AnswerEntity>
  private EventRepository: Repository<EventEntity>
  private UserRepository: Repository<UserEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.AnswerRepository = DATA_SOURCE.getRepository(AnswerEntity)
      this.EventRepository = DATA_SOURCE.getRepository(EventEntity)
      this.UserRepository = DATA_SOURCE.getRepository(UserEntity)
    }
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

      const [users, usersTotal] = await this.UserRepository.findAndCount({
        relations: {
          company: true,
        },
      })

      const uniqCompanies = uniqByKey(users.map(user => user.company), 'id')

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

        users: {
          total: usersTotal,
          owners: users.filter(user => isUserOwner(user)).length,
          photographers: users.filter(user => isUserPhotographer(user)).length,
          users: users.filter(user => isSimplyUser(user)).length,
        },

        companies: {
          total: uniqCompanies.length,
          premiums: uniqCompanies.filter(cie => isPremiumCie(cie)).length,
          mediums: uniqCompanies.filter(cie => isMediumCie(cie)).length,
          basics: uniqCompanies.filter(cie => isBasicCie(cie)).length,
          noEvents: uniqCompanies.filter(cie => cie.eventIds.length === 0).length,
          noEmployee: uniqCompanies.filter(cie => cie.employeeIds.length === 0).length,
        },
      })
    })
  }
}
