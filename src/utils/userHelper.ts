import { sign } from 'jsonwebtoken'
import uid2 from 'uid2'
import { useEnv } from '../env'
import type { UserEntity } from '../entity/UserEntity'
import type { JWTTokenPayload } from '../types'
import { Role, SubscriptionEnum } from '../types'
import type { FileEntity } from '../entity/FileEntity'
import { hasOwnProperty } from './objectHelper'

export function getfullUsername(user: UserEntity | Pick<UserEntity, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`
}

export function isUserEntity(user: any): user is UserEntity {
  return hasOwnProperty(user, 'token') && hasOwnProperty(user, 'roles') && hasOwnProperty(user, 'notificationToken')
}

export function isSubscriptionOptionField(field: string): boolean {
  return Object.values(SubscriptionEnum).includes(field as SubscriptionEnum)
}

export function isUserAdmin(user: UserEntity) {
  return user.roles === Role.ADMIN
}

export function isUserOwner(user: UserEntity) {
  return user.roles === Role.OWNER
}

export function isUserPhotographer(user: UserEntity) {
  return user.roles === Role.PHOTOGRAPHER
}

export function isSimplyUser(user: UserEntity) {
  return user.roles === Role.USER
}

export function createJwtToken(user: JWTTokenPayload) {
  const { JWT_SECRET } = useEnv()
  return sign(
    {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: getfullUsername(user),
      roles: [user.roles],
      subscription: user.subscription ?? SubscriptionEnum.BASIC,
      uniJWT: uid2(128),
    },
    JWT_SECRET,
  )
}
export function createNotificationToken(userId: number) {
  const { JWT_SECRET } = useEnv()
  return sign(
    {
      userId,
      uniJWT: uid2(48),
    },
    JWT_SECRET,
  )
}

export const secretUserKeys = [
  'password',
  'salt',
  'twoFactorSecret',
  'twoFactorRecoveryCode',
  'apiKey',
  'saltUpdatedAt',
  'passwordUpdatedAt',
]

/**
   * @param entity UserEntity
   * @returns entity filtered without any confidential fields
   */
export const userResponse = (entity: UserEntity): UserEntity => {
  const entityReturned = {} as Record<string, any>
  for (const [key, value] of Object.entries(entity)) {
    if (!secretUserKeys.includes(key)) {
      // eslint-disable-next-line security/detect-object-injection
      entityReturned[key] = value
    }
    if (key === 'profilePicture' && value) {
      const picture = value as FileEntity
      // eslint-disable-next-line security/detect-object-injection
      entityReturned[key] = picture.secure_url
    }
  }
  return entityReturned as UserEntity
}
