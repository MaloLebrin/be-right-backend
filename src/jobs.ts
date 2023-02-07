import cron from 'node-cron'
import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import { CronJobInterval } from './utils/cronHelper'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'
import deleteUnusedUsersJob from './jobs/deleteUnusedUsers'

(async () => {
  const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
  } = useEnv()
  const { logger } = useLogger()
  dotenv.config()

  const JOB_APP_SOURCE = createAppSource()

  JOB_APP_SOURCE.initialize()
    .then(() => {
      logger.info('Cron Job Data Source has been initialized!')
    })
    .catch(err => {
      logger.error(err, 'Error during Cron Job Data Source initialization')
    })

  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  cron.schedule(
    CronJobInterval.EVERY_DAY_4_AM,
    async () => {
      // await udpateEventStatusJob(JOB_APP_SOURCE)
      await deleteUnusedUsersJob(JOB_APP_SOURCE)
    },
  )
})()
