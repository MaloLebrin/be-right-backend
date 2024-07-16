import { sign } from 'jsonwebtoken'
import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import uid2 from 'uid2'
import AnswerEntity from '../entity/AnswerEntity'
import { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import EventEntity from '../entity/EventEntity'
import { useEnv } from '../env'
import { ApiError } from '../middlewares/ApiError'
import { answerResponse } from '../utils/answerHelper'

export default class AnswerService {
  private repository: Repository<AnswerEntity>
  private eventRepository: Repository<EventEntity>
  private employeeRepository: Repository<EmployeeEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.eventRepository = APP_SOURCE.getRepository(EventEntity)
  }

  private generateAnswerToken(employee: EmployeeEntity, answerId: number, eventId: number) {
    const { JWT_SECRET } = useEnv()
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

  public filterSecretAnswersKeys(answers: AnswerEntity[]) {
    return answers?.length > 0
      ? answers.map(answer => answerResponse(answer))
      : []
  }

  public createOne = async (eventId: number, employeeId: number) => {
    const [event, employee] = await Promise.all([
      this.eventRepository.findOne({
        where: {
          id: eventId,
        },
      }),
      this.employeeRepository.findOne({
        where: {
          id: employeeId,
        },
      }),
    ])

    if (!event || !employee) {
      throw new ApiError(422, 'Missing parameters')
    }

    const newAnswer = this.repository.create({
      event,
      employee: { id: employeeId },
      twoFactorCode: uid2(5).toUpperCase(),
      twoFactorSecret: uid2(128),
    })
    newAnswer.token = this.generateAnswerToken(employee, newAnswer.id, eventId)
    await this.repository.save(newAnswer)
    return {
      ...newAnswer,
      employee,
    }
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

  public getOne = async (answerId: number, withRelations?: boolean): Promise<AnswerEntity> => {
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

  public signOneAnswer = async (id: number, { hasSigned, reason }: { hasSigned: boolean; reason?: string }) => {
    await this.repository.update(id, {
      signedAt: new Date(),
      hasSigned,
      reason: reason || null,
    })
  }

  public updateOneAnswer = async (id: number, answer: Partial<AnswerEntity>) => {
    if (answer.employeeId) {
      delete answer.employeeId
    }

    if (answer.eventId) {
      delete answer.eventId
    }

    if (answer.mailsIds) {
      delete answer.mailsIds
    }

    await this.repository.update(id, answer)
    return this.getOne(id)
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
