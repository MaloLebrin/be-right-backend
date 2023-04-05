import { sign } from 'jsonwebtoken'
import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import uid2 from 'uid2'
import AnswerEntity from '../entity/AnswerEntity'
import { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import EventEntity from '../entity/EventEntity'
import { useEnv } from '../env'
import { ApiError } from '../middlewares/ApiError'

export default class AnswerService {
  getManager: EntityManager

  repository: Repository<AnswerEntity>
  eventRepository: Repository<EventEntity>
  employeeRepository: Repository<EmployeeEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.eventRepository = APP_SOURCE.getRepository(EventEntity)
    this.getManager = APP_SOURCE.manager
  }

  private generateAnswerToken(employee: EmployeeEntity, answerId: number, eventId: number) {
    const { JWT_SECRET } = useEnv()
    if (!JWT_SECRET) {
      throw new ApiError(422, 'le JWT secret est manquant')
    }
    return sign(
      {
        employeeId: employee.id,
        eventId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        answerId,
        uniJWT: uid2(128),
      },
      JWT_SECRET,
    )
  }

  public createOne = async (eventId: number, employeeId: number) => {
    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiError(422, 'l\'événément n\'existe pas')
    }

    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,
      },
    })

    if (!employee) {
      throw new ApiError(422, 'le destinataire n\'existe pas')
    }

    const newAnswer = this.repository.create({
      event,
      employee: employeeId,
      twoFactorCode: uid2(5).toUpperCase(),
      twoFactorSecret: uid2(128),
    })
    newAnswer.token = this.generateAnswerToken(employee, newAnswer.id, eventId)
    await this.repository.save(newAnswer)
    return newAnswer
  }

  public createMany = async (eventId: number, employeeIds: number[]) => {
    return Promise.all(employeeIds.map(employeeId => this.createOne(eventId, employeeId)))
  }

  public getOneAnswerForEventEmployee = async (
    { eventId, employeeId, withRelation }: { eventId: number; employeeId: number; withRelation?: boolean }) => {
    return await this.repository.findOne({
      where: {
        event: {
          id: eventId,
        },
        employee: {
          id: employeeId,
        },
      },
      relations: {
        employee: withRelation,
      },
    })
  }

  public getAllAnswersForEvent = async (eventId: number, withRelation?: boolean) => {
    return this.repository.find({
      where: {
        event: {
          id: eventId,
        },
      },
      relations: {
        employee: withRelation,
      },
    })
  }

  public getAnswerIdsForEvent = async (eventId: number): Promise<number[]> => {
    const answers = await this.repository.find({
      select: {
        id: true,
      },
      where: {
        event: {
          id: eventId,
        },
      },
    })
    return answers.map(a => a.id)
  }

  public getAnswersForManyEvents = async (eventIds: number[], withRelation?: boolean) => {
    return this.repository.find({
      where: {
        event: In(eventIds),
      },
      relations: {
        employee: withRelation,
      },
    })
  }

  public getAllAnswersForEmployee = async (employeeId: number) => {
    return await this.repository.find({
      where: {
        employee: { id: employeeId },
      },
    })
  }

  public getOne = async (answerId: number, withRelations?: boolean): Promise<AnswerEntity | null> => {
    return await this.repository.findOne({
      where: {
        id: answerId,
      },
      relations: {
        employee: withRelations,
        event: withRelations,
      },
    })
  }

  public getMany = async (ids: number[], withRelations?: boolean) => {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: {
        employee: withRelations,
        event: withRelations,
      },
    })
  }

  public updateOneAnswer = async (id: number, answer: AnswerEntity) => {
    const answerToUpdate = await this.getOne(id)
    const updatedAnswer = {
      ...answerToUpdate,
      signedAt: new Date(),
      hasSigned: answer.hasSigned,
      reason: answer.reason,
    }
    await this.repository.save(updatedAnswer)
    return updatedAnswer
  }

  public deleteOne = async (id: number) => {
    const deleted = await this.repository.softDelete(id)
    return deleted
  }

  public deleteMany = async (ids: number[]) => {
    const deleted = await this.repository.softDelete(ids)
    return deleted
  }
}
