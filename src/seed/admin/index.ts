import uid2 from 'uid2'
import type { DataSource, Repository } from 'typeorm'
import dayjs from 'dayjs'
import { createJwtToken } from '../../utils/'
import { UserEntity } from '../../entity/UserEntity'
import { generateHash } from '../../utils'
import { Role, SubscriptionEnum } from '../../types'
import { BaseSeedClass } from '../Base/BaseSeedClass'
import { CompanyEntity } from '../../entity/Company.entity'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'

export class UserAdminSeed extends BaseSeedClass {
  UserRepository: Repository<UserEntity>
  CompanyRepository: Repository<CompanyEntity>

  constructor(SEED_SOURCE: DataSource) {
    super(SEED_SOURCE)
    this.CompanyRepository = SEED_SOURCE.getRepository(CompanyEntity)
    this.UserRepository = SEED_SOURCE.getRepository(UserEntity)
  }

  async CreateAdminUser() {
    if (process.env.ADMIN_EMAIL) {
      const subscription = this.getManager.create(SubscriptionEntity, {
        type: SubscriptionEnum.PREMIUM,
        expireAt: dayjs().add(1, 'year'),
      })

      await this.getManager.save(subscription)

      const newCompany = this.CompanyRepository.create({
        name: 'Zenika',
        subscription,
        subscriptionLabel: subscription.type,
      })

      await this.CompanyRepository.save(newCompany)

      const salt = uid2(128)
      const newUser = this.UserRepository.create({
        email: process.env.ADMIN_EMAIL,
        firstName: 'Malo',
        lastName: 'Lebrin',
        salt,
        roles: Role.ADMIN,
        token: createJwtToken({
          email: process.env.ADMIN_EMAIL,
          firstName: 'Malo',
          lastName: 'Lebrin',
          roles: Role.ADMIN,
          subscription: SubscriptionEnum.PREMIUM,
        }),
        password: generateHash(salt, process.env.ADMIN_PASSWORD),
        company: newCompany,
      })

      await this.UserRepository.save(newUser)

      newCompany.owners = [newUser]
      newCompany.users = [newUser]

      await this.CompanyRepository.save(newCompany)

      await this.AddressService.createOne({
        address: {
          addressLine: '2 bis rue du gros chêne',
          postalCode: '44300',
          city: 'Nantes',
          country: 'France',
        },
        companyId: newCompany.id,
      })

      return newUser
    }
  }
}
