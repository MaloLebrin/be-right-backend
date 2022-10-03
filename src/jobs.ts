import { createConnection, getConnectionOptions } from 'typeorm'
import cron from 'node-cron'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import { CronJobInterval } from './utils/cronHelper'
import udpateEventStatusJob from './jobs/updateEventsStatusJob'
import { useLogger } from './middlewares/loggerService'

(async () => {
  const config = await getConnectionOptions(process.env.NODE_ENV) as PostgresConnectionOptions
  let connectionsOptions = config

  if (process.env.NODE_ENV === 'production') {
    connectionsOptions = {
      ...config,
      url: process.env.DATABASE_URL!,
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
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    cron.schedule(
      CronJobInterval.EVERY_DAY_4_AM,
      async () => {
        logger.info('start udpateEventStatus jobs')
        await udpateEventStatusJob()
        logger.info('end udpateEventStatus jobs')
      },
    )

    // cron.schedule(
    //   CronJobInterval.EVERY_MINUTE,
    //   async () => deleteOldLogosJob()
    // )
  })
})()
