import * as dotenv from 'dotenv'
import { useLogger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { clearDB, createAppSource } from '../utils'
import { createAdminUser } from './admin'
import { createPhotographers } from './shared/photographerFixtures'
import { seedMediumUserData, seedUserCompany } from './UserCompany'

export const APP_SOURCE_SEEDER = createAppSource()

async function createDevSeeders() {
  const {
    NODE_ENV,
  } = useEnv()

  if (NODE_ENV !== 'production') {
    APP_SOURCE_SEEDER.initialize().then(async () => {
      const { logger } = useLogger()
      dotenv.config()

      logger.info('Clear DB start')
      await clearDB()
      logger.info('Clear DB end')

      logger.info('start seeds jobs')

      await createPhotographers()
      await createAdminUser(APP_SOURCE_SEEDER)
      await seedUserCompany(APP_SOURCE_SEEDER)
      await seedMediumUserData(APP_SOURCE_SEEDER)

      logger.info('end seeds jobs')
    })
  }
}

createDevSeeders()
