import type { DataSource } from 'typeorm'
import uid2 from 'uid2'
import { type CreateUserPayload, type PhotographerCreatePayload, Role } from '../../types'
import { generateHash } from '../../utils'
import { createJwtToken, createNotificationToken, userResponse } from '../../utils/userHelper'
import { BaseUserService } from './BaseUser.service'

export class CreateUserService extends BaseUserService {
  constructor(APP_SOURCE: DataSource) {
    super(APP_SOURCE)
  }

  async createOneUser(payload: CreateUserPayload) {
    const {
      email,
      firstName,
      lastName,
      password,
      role,
      subscription,
      loggedAt,
      companyId,
      signature,
    } = payload

    const salt = uid2(128)
    const twoFactorSecret = uid2(128)
    const twoFactorRecoveryCode = generateHash(twoFactorSecret, email)

    const newUser = this.repository.create({
      email,
      firstName,
      lastName,
      salt,
      roles: role,
      twoFactorRecoveryCode,
      twoFactorSecret,
      token: createJwtToken({
        email,
        firstName,
        lastName,
        roles: role,
        subscription,
      }),
      password: generateHash(salt, password),
      signature,
      loggedAt: loggedAt || null,
      company: {
        id: companyId,
      },
    })

    const userToSend = await this.repository.save({
      ...newUser,
      notificationToken: createNotificationToken(newUser.id),
    })

    return userToSend
  }

  async createOnePhotoGrapher(user: PhotographerCreatePayload) {
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
    })
    const userToSend = await this.repository.save({
      ...newUser,
      notificationToken: createNotificationToken(newUser.id),
    })
    return userResponse(userToSend)
  }
}
