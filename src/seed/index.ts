import * as dotenv from 'dotenv'
import { createConnection, getConnectionOptions } from 'typeorm'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { useLogger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { clearDB } from '../utils'
import { createAdminUser } from './admin'
import { createPhotographers } from './shared/photographerFixtures'
import { seedUserCompany } from './UserCompany'

async function createDevSeeders() {
  const {
    NODE_ENV,
  } = useEnv()

  const config = await getConnectionOptions(NODE_ENV) as PostgresConnectionOptions
  let connectionsOptions = config

  if (NODE_ENV !== 'production') {
    connectionsOptions = {
      ...config,
      name: 'default',
    }

    createConnection(connectionsOptions).then(async () => {
      const { logger } = useLogger()
      dotenv.config()

      logger.info('Clear DB start')
      await clearDB()
      logger.info('Clear DB end')

      logger.info('start seeds jobs')
      await createPhotographers()
      await createAdminUser()
      await seedUserCompany()

      logger.info('end seeds jobs')
    })
  }
}

createDevSeeders()
