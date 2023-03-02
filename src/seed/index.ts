import * as dotenv from 'dotenv'
import type { DataSource } from 'typeorm'
import { logger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { clearDB, createAppSource } from '../utils'
import { UserAdminSeed } from './admin'
import { UserSeedClass } from './UserCompany/UserSeedClass'

export const APP_SOURCE_SEEDER = createAppSource()

export async function seedersFunction(DATA_SOURCE: DataSource) {
  const UserSeedService = new UserSeedClass(DATA_SOURCE)
  const UserAdminSeedClass = new UserAdminSeed(DATA_SOURCE)
  await clearDB(DATA_SOURCE)
  await UserAdminSeedClass.CreateAdminUser()
  await UserSeedService.SeedDataBase()
}

async function createDevSeeders() {
  const {
    NODE_ENV,
  } = useEnv()

  if (NODE_ENV === 'test') {
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
