import cron from 'node-cron'
import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import { CronJobInterval } from './utils/cronHelper'
import udpateEventStatusJob from './jobs/updateEventsStatusJob'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'

(async () => {
  const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
  } = useEnv()

  const JOB_APP_SOURCE = createAppSource()

  JOB_APP_SOURCE.initialize().then(async () => {
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
        await udpateEventStatusJob(JOB_APP_SOURCE)
        logger.info('end udpateEventStatus jobs')
      },
    )
  })
})()
