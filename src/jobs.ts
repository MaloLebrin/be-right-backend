import { createConnection, getConnectionOptions } from 'typeorm'
import cron from 'node-cron'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import { CronJobInterval } from './utils/cronHelper'
import udpateEventStatusJob from './jobs/updateEventsStatusJob'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'

(async () => {
  const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    DATABASE_URL,
    NODE_ENV,
  } = useEnv()

  const config = await getConnectionOptions(NODE_ENV) as PostgresConnectionOptions
  let connectionsOptions = config

  if (NODE_ENV === 'production') {
    connectionsOptions = {
      ...config,
      url: DATABASE_URL!,
    }
  } else {
    connectionsOptions = {
      ...config,
      name: 'default',
    }
  }

  createConnection(connectionsOptions).then(async () => {
    const { logger } = useLogger()
    dotenv.config()

    cloudinary.v2.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    })

    cron.schedule(
      CronJobInterval.EVERY_DAY_4_AM,
      async () => {
        logger.info('start udpateEventStatus jobs')
        await udpateEventStatusJob()
        logger.info('end udpateEventStatus jobs')
      },
    )
  })
})()
