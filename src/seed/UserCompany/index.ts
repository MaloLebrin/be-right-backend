import UserService from '../../services/UserService'
import { AddressService } from '../../services/AddressService'
import {
  addressFixtureCompanyPremium,
  userCompanyFixturePremium,
} from './fixtures'

export async function seedUserCompany() {
  const user = await UserService.createOneUser(userCompanyFixturePremium)

  const userAddress = await AddressService.createOne({
    address: addressFixtureCompanyPremium,
    userId: user.id,
  })
}
