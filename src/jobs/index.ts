import cron from 'node-cron'
import * as dotenv from 'dotenv'
import { CronJobInterval } from '../utils/cronHelper'
import { logger } from '../middlewares/loggerService'
import { createAppSource } from '../utils'
import deleteUnusedUsersJob from './crons/deleteUnusedUsers'
import { deleteReadOldNotifications } from './crons/deleteReadOldNotifications'
import { deleteOldEventsJob } from './crons/deleteOldEventsJob'
import { sendMailBeforeStartEvent } from './crons/sendMailBeforeStartEvent.cron'

export async function cronJobsStart() {
  dotenv.config()

  const JOB_APP_SOURCE = createAppSource()

  JOB_APP_SOURCE.initialize()
    .then(() => {
      logger.info('Cron Job Data Source has been initialized!')
    })
    .catch(err => {
      logger.error(err, 'Error during Cron Job Data Source initialization')
    })

  cron.schedule(
    CronJobInterval.EVERY_DAY_4_AM,
    async () => {
      await sendMailBeforeStartEvent(JOB_APP_SOURCE)
    },
  )

  cron.schedule(
    CronJobInterval.EVERY_FIRST_DAY_MONTH_MIDNIGHT,
    async () => {
      await deleteUnusedUsersJob(JOB_APP_SOURCE)
      await deleteReadOldNotifications(JOB_APP_SOURCE)
      await deleteOldEventsJob(JOB_APP_SOURCE)
    },
  )
}
