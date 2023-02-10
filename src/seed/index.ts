import * as dotenv from 'dotenv'
import type { DataSource } from 'typeorm'
import { useLogger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { clearDB, createAppSource } from '../utils'
import { createAdminUser } from './admin'
import { createPhotographers } from './shared/photographerFixtures'
import { seedMediumUserData, seedUnUsedUser, seedUserCompany } from './UserCompany'

export const APP_SOURCE_SEEDER = createAppSource()

export async function seedersFunction(DATA_SOURCE: DataSource) {
  await clearDB(DATA_SOURCE)
  await createPhotographers(DATA_SOURCE)
  await createAdminUser(DATA_SOURCE)
  await seedUserCompany(DATA_SOURCE)
  await seedMediumUserData(DATA_SOURCE)
  await seedUnUsedUser(DATA_SOURCE)
}

async function createDevSeeders() {
  const {
    NODE_ENV,
  } = useEnv()

  if (NODE_ENV === 'test') {
    const { logger } = useLogger()
    APP_SOURCE_SEEDER.initialize().then(async () => {
      dotenv.config()

      logger.info('Clear DB start')
      await seedersFunction(APP_SOURCE_SEEDER)
      logger.info('Clear DB end')
      logger.info('seeder done')
    }).catch(err => {
      logger.error('Error during Data Source initialization seeder:', err)
    })
  }
}

createDevSeeders()
