import type { Repository } from 'typeorm/repository/Repository'
import type { DataSource } from 'typeorm/data-source'
import { CompanyEntity } from '../../entity/Company.entity'
import { UserEntity } from '../../entity/UserEntity'
import { StripeService } from '../../services/stripe/stripe.service'
import { getfullUsername } from '../../utils/userHelper'

export class StripeCustomerService extends StripeService {
  private UserRepository: Repository<UserEntity>
  private CompanyRepository: Repository<CompanyEntity>

  constructor(APP_SOURCE: DataSource) {
    super()
    this.CompanyRepository = APP_SOURCE.getRepository(CompanyEntity)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
  }

  public createStripeCustomer = async (user: UserEntity) => {
    const company = await this.CompanyRepository.findOne({
      where: { id: user?.companyId },
      relations: { address: true },
    })

    const companyAddress = company.address

    const stripeCustomer = await this.stripe.customers.create({
      email: user.email,
      name: getfullUsername(user),
      address: {
        city: companyAddress?.city,
        country: companyAddress?.country,
        line1: companyAddress?.addressLine,
        line2: companyAddress?.addressLine2,
        postal_code: companyAddress?.postalCode,
      },
    })

    await this.UserRepository.update(user.id, { stripeCustomerId: stripeCustomer.id })

    return stripeCustomer
  }

  /**
   * Return curstomer by user, or create new stripeCustomer
   * @returns Stripe.Customer
   */
  public getStripeCustomerForUser = async (user: UserEntity) => {
    if (user.stripeCustomerId) {
      return this.stripe.customers.retrieve(user.stripeCustomerId)
    }

    return this.createStripeCustomer(user)
  }
}
