import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { verify } from 'jsonwebtoken'
import { wrapperRequest } from '../../utils'
import { APP_SOURCE } from '../..'
import AnswerService from '../../services/AnswerService'
import AnswerEntity from '../../entity/AnswerEntity'
import { useEnv } from '../../env'
import { ApiError } from '../../middlewares/ApiError'
import type { DecodedJWTToken } from '../../types'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import { answerResponse } from '../../utils/answerHelper'
import EventEntity from '../../entity/EventEntity'

export class AnswerSpecificController {
  AnswerService: AnswerService
  EventRepository: Repository<EventEntity>
  AnswerRepository: Repository<AnswerEntity>
  EmployeeRepository: Repository<EmployeeEntity>

  constructor() {
    this.EmployeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.EventRepository = APP_SOURCE.getRepository(EventEntity)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
  }

  private async isValidToken(token: string, email: string) {
    const { JWT_SECRET } = useEnv()

    const decodedToken = verify(token, JWT_SECRET) as DecodedJWTToken | string

    if (decodedToken && typeof decodedToken !== 'string') {
      if (email !== decodedToken.email) {
        throw new ApiError(401, 'Action non autorisée')
      }
      return decodedToken
    }
    return false
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const token = req.query.token.toString()
      const email = req.query.email.toString()

      if (!token || !email) {
        throw new ApiError(422, 'identifiant du destinataire manquant')
      }

      await this.isValidToken(token, email)

      const answer = await this.AnswerRepository.findOneBy({ token })

      if (!answer) {
        throw new ApiError(422, 'Élément introuvable')
      }

      if (answer.signedAt) {
        throw new ApiError(422, 'Vous avez déjà donné une réponse')
      }

      const event = await this.EventRepository.findOne({
        where: {
          id: answer.eventId,
        },
      })

      const employee = await this.EmployeeRepository.findOne({
        where: {
          email,
          id: answer.employeeId,
        },
      })

      if (!event || !employee) {
        throw new ApiError(
          422,
          `${!event ? 'Événement' : ''} ${(!event && !employee) ? 'et' : ''} ${!employee ? 'Destinataire' : ''} introuvable `)
      }

      return res.status(200).json({
        answer: answerResponse(answer),
        event,
        employee,
      })
    })
  }

  public updateAnswerByEmployee = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      // TODO
    })
  }
}
