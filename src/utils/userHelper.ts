import { sign } from 'jsonwebtoken'
import uid2 from 'uid2'
import { useEnv } from '../env'
import type { UserEntity } from '../entity/UserEntity'
import type { JWTTokenPayload } from '../types'
import { Role, SubscriptionEnum } from '../types'
import { hasOwnProperty } from './objectHelper'

export function getfullUsername(user: UserEntity | Pick<UserEntity, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`
}

export function isUserEntity(user: any): user is UserEntity {
  return hasOwnProperty(user, 'token') && hasOwnProperty(user, 'salt')
}

export function isSubscriptionOptionField(field: string): boolean {
  return Object.values(SubscriptionEnum).includes(field as SubscriptionEnum)
}

export function isUserAdmin(user: UserEntity) {
  return user.roles === Role.ADMIN
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
