import uid2 from 'uid2'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type EventEntity from '../entity/EventEntity'
import { UserEntity } from '../entity/UserEntity'
import type { FileEntity } from '../entity/FileEntity'
import { generateHash, userResponse } from '../utils'
import { addUserToEntityRelation, formatEntityRelationWithId } from '../utils/entityHelper'
import { Role } from '../types'
import type { CreateUserPayload, PhotographerCreatePayload, ThemeEnum } from '../types'
import { createJwtToken } from '../utils/'
import { APP_SOURCE } from '..'

export default class UserService {
  static repository = APP_SOURCE.getRepository(UserEntity)

  public static async getByToken(token: string): Promise<UserEntity> {
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

  public static async updateTheme(id: number, theme: ThemeEnum) {
    const user = await this.repository.findOne({
      where: { id },
    })

    user.theme = theme
    await this.repository.save(user)
    return user
  }

  public static async getOne(id: number, withRelation?: boolean) {
    if (withRelation) {
      return this.getOneWithRelations(id)
    }

    return this.repository.findOne({
      where: { id },
    })
  }

  public static async getOneWithRelations(id: number): Promise<UserEntity> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['events', 'files', 'employee', 'profilePicture', 'address'],
    })

    if (user) {
      const events = user.events as EventEntity[]
      const employees = user.employee as EmployeeEntity[]
      const files = user.files as FileEntity[]

      return {
        ...user,
        events: formatEntityRelationWithId(events),
        employee: formatEntityRelationWithId(employees),
        files: formatEntityRelationWithId(files),
      }
    } else {
      return user
    }
  }

  public static async getMany(ids: number[]) {
    const users = await Promise.all(ids.map(id => this.getOneWithRelations(id)))
    return users.length > 0 ? users.filter(user => user).map(user => userResponse(user)) : []
  }

  public static async updateOne(id: number, payload: UserEntity) {
    const userFinded = await this.repository.findOne({ where: { id } })

    const userUpdated = {
      ...userFinded,
      ...payload,
      updatedAt: new Date(),
      token: payload.roles !== userFinded.roles ? createJwtToken(payload) : userFinded.token,
    }
    await this.repository.save(userUpdated)
  }

  public static async findOneByEmail(email: string) {
    return this.repository.findOne({ where: { email } })
  }

  public static async createOnePhotoGrapher(user: PhotographerCreatePayload) {
    const newUser = this.repository.create({
      ...user,
      salt: uid2(128),
      token: createJwtToken({
        firstName: user.firstName,
        lastName: user.lastName,
        roles: Role.PHOTOGRAPHER,
      }),
      roles: Role.PHOTOGRAPHER,
    })
    await this.repository.save(newUser)
    return userResponse(newUser)
  }

  public static async createOneUser(payload: CreateUserPayload) {
    const {
      companyName,
      email,
      firstName,
      lastName,
      password,
      role,
      subscription,
    } = payload

    const salt = uid2(128)
    const user = {
      companyName,
      email,
      firstName,
      lastName,
      salt,
      roles: role,
      token: createJwtToken({
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

  public static async createPhotographer(photographer: PhotographerCreatePayload): Promise<UserEntity> {
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
