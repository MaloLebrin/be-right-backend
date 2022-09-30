import { getManager } from 'typeorm'
import uid2 from 'uid2'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type EventEntity from '../entity/EventEntity'
import { UserEntity } from '../entity/UserEntity'
import type { FileEntity } from '../entity/FileEntity'
import { userResponse } from '../utils'
import { addUserToEntityRelation, formatEntityRelationWithId } from '../utils/entityHelper'
import type { PhotographerCreatePayload, ThemeEnum } from '../types'
import { Role } from '../types'

export default class UserService {
  public static async getByToken(token: string): Promise<UserEntity> {
    const userFinded = await getManager().findOne(UserEntity, { token }, { relations: ['events', 'files', 'employee', 'employee.address', 'profilePicture', 'address'] })
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
    const user = await getManager().findOne(UserEntity, id)
    user.theme = theme
    await getManager().save(user)
    return user
  }

  public static async getOneWithRelations(id: number): Promise<UserEntity> {
    const user = await getManager().findOne(UserEntity, id, { relations: ['events', 'files', 'employee', 'profilePicture', 'address'] })
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
    const userFinded = await getManager().findOne(UserEntity, id)
    const userUpdated = {
      ...userFinded,
      ...payload,
      updatedAt: new Date(),
    }
    await getManager().save(UserEntity, userUpdated)
  }

  public static async findOneByEmail(email: string) {
    return getManager().findOne(UserEntity, { email })
  }

  public static async createOnePhotoGrapher(user: PhotographerCreatePayload) {
    const newUser = getManager().create(UserEntity, {
      ...user,
      salt: uid2(128),
      token: uid2(128),
      roles: Role.PHOTOGRAPHER,
    })
    await getManager().save(newUser)
    return userResponse(newUser)
  }
}
