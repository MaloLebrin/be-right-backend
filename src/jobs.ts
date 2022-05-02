import { createConnection, getConnectionOptions, getManager } from "typeorm"
import { CronJobInterval } from "./utils/cronHelper"
import cron from 'node-cron'
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import * as dotenv from "dotenv"
import cloudinary from "cloudinary"
import udpateEventStatusJob from "./jobs/updateEventsStatusJob"

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

  createConnection(connectionsOptions).then(async connection => {
    dotenv.config()

    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    cron.schedule(
      CronJobInterval.EVERY_DAY_4_AM,
      async () => {
        await udpateEventStatusJob()
      }
    )

    // cron.schedule(
    //   CronJobInterval.EVERY_MINUTE,
    //   async () => deleteOldLogosJob()
    // )
  })
})()
