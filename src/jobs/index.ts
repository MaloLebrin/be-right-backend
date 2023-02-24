import cron from 'node-cron'
import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import { CronJobInterval } from '../utils/cronHelper'
import { logger } from '../middlewares/loggerService'
import { useEnv } from '../env'
import { createAppSource } from '../utils'
import deleteUnusedUsersJob from './crons/deleteUnusedUsers'
import { deleteReadOldNotifications } from './crons/deleteReadOldNotifications'

(async () => {
  const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
  } = useEnv()
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

  // cron.schedule(
  //   CronJobInterval.EVERY_DAY_4_AM,
  //   async () => {
  //     await udpateEventStatusJob(JOB_APP_SOURCE)
  //   },
  // )

  cron.schedule(
    CronJobInterval.EVERY_FIRST_DAY_MONTH_MIDNIGHT,
    async () => {
      await deleteUnusedUsersJob(JOB_APP_SOURCE)
      await deleteReadOldNotifications(JOB_APP_SOURCE)
    },
  )
})()
