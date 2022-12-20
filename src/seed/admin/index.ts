import { getManager } from 'typeorm'
import uid2 from 'uid2'
import { createJwtToken } from '../../utils/'
import { UserEntity } from '../../entity'
import { generateHash } from '../../utils'
import { Role, SubscriptionEnum } from '@/types'

export async function createAdminUser() {
  const salt = uid2(128)
  const newUser = getManager().create(UserEntity, {
    companyName: 'Zenika',
    email: process.env.ADMIN_EMAIL,
    firstName: 'Malo',
    lastName: 'Lebrin',
    salt,
    roles: Role.ADMIN,
    token: createJwtToken({
      firstName: 'Malo',
      lastName: 'Lebrin',
      roles: Role.ADMIN,
      subscription: SubscriptionEnum.PREMIUM,
    }),
    password: generateHash(salt, process.env.ADMIN_PASSWORD),
    events: [],

  })
  await getManager().save(newUser)
  return newUser
}
