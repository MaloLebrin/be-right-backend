import uid2 from 'uid2'
import type { DataSource, Repository } from 'typeorm'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type EventEntity from '../entity/EventEntity'
import { UserEntity } from '../entity/UserEntity'
import type { FileEntity } from '../entity/FileEntity'
import { generateHash, userResponse } from '../utils'
import { addUserToEntityRelation } from '../utils/entityHelper'
import { Role } from '../types'
import type { CreateUserPayload, PhotographerCreatePayload, ThemeEnum } from '../types'
import { createJwtToken } from '../utils/'
import { SubscriptionService } from './SubscriptionService'

export default class UserService {
  repository: Repository<UserEntity>
  subscriptionService: SubscriptionService

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(UserEntity)
    this.subscriptionService = new SubscriptionService(APP_SOURCE)
  }

  async getByToken(token: string): Promise<UserEntity> {
    const userFinded = await this.repository.findOne({
      where: { token },
      relations: ['events', 'files', 'employee', 'employee.address', 'profilePicture', 'address'],
    })

    if (userFinded) {
      const events = userFinded.events as EventEntity[]
      const employees = userFinded.employee as EmployeeEntity[]
      const files = userFinded.files as FileEntity[]

      return {
        ...userFinded,
        events: addUserToEntityRelation(events, userFinded.id),
        employee: addUserToEntityRelation(employees, userFinded.id),
        files: addUserToEntityRelation(files, userFinded.id),
      }
    }
  }

  async updateTheme(id: number, theme: ThemeEnum) {
    const user = await this.repository.findOne({
      where: { id },
    })

    user.theme = theme
    await this.repository.save(user)
    return user
  }

  async getOne(id: number, withRelation?: boolean) {
    if (withRelation) {
      return this.getOneWithRelations(id)
    }

    return this.repository.findOne({
      where: { id },
    })
  }

  async getOneWithRelations(id: number): Promise<UserEntity> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['events', 'files', 'employee', 'profilePicture', 'address', 'subscription'],
    })
    return user
  }

  async getMany(ids: number[]): Promise<UserEntity[]> {
    const users = await Promise.all(ids.map(id => this.getOneWithRelations(id)))
    return users.length > 0 ? users.filter(user => user).map(user => userResponse(user)) : []
  }

  async updateOne(id: number, payload: UserEntity) {
    const userFinded = await this.repository.findOne({ where: { id } })

    const userUpdated = {
      ...userFinded,
      ...payload,
      updatedAt: new Date(),
      token: payload.roles !== userFinded.roles
        ? createJwtToken({
          email: userFinded.email,
          firstName: userFinded.firstName,
          lastName: userFinded.lastName,
          roles: payload.roles,
        })
        : userFinded.token,
    }
    await this.repository.save(userUpdated)
  }

  async findOneByEmail(email: string) {
    return this.repository.findOne({ where: { email } })
  }

  async createOnePhotoGrapher(user: PhotographerCreatePayload) {
    const subscription = await this.subscriptionService.createBasicSubscription()
    const newUser = this.repository.create({
      ...user,
      salt: uid2(128),
      token: createJwtToken({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: Role.PHOTOGRAPHER,
      }),
      roles: Role.PHOTOGRAPHER,
      subscription,
      subscriptionLabel: subscription.type,
    })
    await this.repository.save(newUser)
    return userResponse(newUser)
  }

  async createOneUser(payload: CreateUserPayload) {
    const {
      companyName,
      email,
      firstName,
      lastName,
      password,
      role,
      subscription,
    } = payload

    const subscriptionEntity = await this.subscriptionService.createOne(subscription)

    const salt = uid2(128)
    const user = {
      companyName,
      email,
      firstName,
      lastName,
      salt,
      roles: role,
      subscription: subscriptionEntity,
      subscriptionLabel: subscriptionEntity.type,
      token: createJwtToken({
        email,
        firstName,
        lastName,
        roles: role,
        subscription,
      }),
      password: generateHash(salt, password),
      events: [],
    }
    const newUser = this.repository.create(user)
    await this.repository.save(newUser)
    return newUser
  }

  async createPhotographer(photographer: PhotographerCreatePayload): Promise<UserEntity> {
    const userAlReadyExist = await this.findOneByEmail(photographer.email)

    if (userAlReadyExist) {
      await this.updateOne(userAlReadyExist.id, {
        ...userAlReadyExist,
        ...photographer,
      })
      const newPhotographer = await this.getOneWithRelations(userAlReadyExist.id)
      return newPhotographer
    }
    return await this.createOnePhotoGrapher(photographer) as UserEntity
  }
}
