import { createAdminUser } from './admin'
import { createPhotographers } from './shared/photographerFixtures'
import { seedUserCompany } from './UserCompany'

async function createDevSeeders() {
  await createPhotographers()
  await createAdminUser()
  await seedUserCompany()
}

createDevSeeders()
