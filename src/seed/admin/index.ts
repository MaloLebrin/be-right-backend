import uid2 from 'uid2'
import type { DataSource } from 'typeorm'
import { createJwtToken } from '../../utils/'
import { UserEntity } from '../../entity/UserEntity'
import { generateHash } from '../../utils'
import { Role, SubscriptionEnum } from '../../types'
import { SubscriptionService } from '../../services/SubscriptionService'
import { AddressService } from '../../services'

export async function createAdminUser(APP_SOURCE_SEEDER: DataSource) {
  const manager = APP_SOURCE_SEEDER.getRepository(UserEntity)
  const addressService = new AddressService(APP_SOURCE_SEEDER)

  const subscription = await new SubscriptionService(APP_SOURCE_SEEDER).createOne(SubscriptionEnum.PREMIUM)

  const salt = uid2(128)
  const newUser = manager.create({
    companyName: 'Zenika',
    email: process.env.ADMIN_EMAIL,
    firstName: 'Malo',
    lastName: 'Lebrin',
    salt,
    roles: Role.ADMIN,
    subscription,
    subscriptionLabel: subscription.type,
    token: createJwtToken({
      email: process.env.ADMIN_EMAIL,
      firstName: 'Malo',
      lastName: 'Lebrin',
      roles: Role.ADMIN,
      subscription: SubscriptionEnum.PREMIUM,
    }),
    password: generateHash(salt, process.env.ADMIN_PASSWORD),
    events: [],
  })

  await manager.save(newUser)

  await addressService.createOne({
    address: {
      addressLine: '2 bis rue du gros chêne',
      postalCode: '44300',
      city: 'Nantes',
      country: 'France',
    },
    userId: newUser.id,
  })

  return newUser
}
