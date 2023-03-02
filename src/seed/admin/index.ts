import uid2 from 'uid2'
import type { DataSource, Repository } from 'typeorm'
import { createJwtToken } from '../../utils/'
import { UserEntity } from '../../entity/UserEntity'
import { generateHash } from '../../utils'
import { Role, SubscriptionEnum } from '../../types'
import { SubscriptionService } from '../../services/SubscriptionService'
import { BaseSeedClass } from '../Base/BaseSeedClass'

export class UserAdminSeed extends BaseSeedClass {
  SubscriptionService: SubscriptionService
  UserRepository: Repository<UserEntity>

  constructor(SEED_SOURCE: DataSource) {
    super(SEED_SOURCE)
    this.SubscriptionService = new SubscriptionService(SEED_SOURCE)
    this.UserRepository = SEED_SOURCE.getRepository(UserEntity)
  }

  async CreateAdminUser() {
    const subscription = await this.SubscriptionService.createOne(SubscriptionEnum.PREMIUM)

    const salt = uid2(128)
    const newUser = this.UserRepository.create({
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

    await this.UserRepository.save(newUser)

    await this.AddressService.createOne({
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
}
