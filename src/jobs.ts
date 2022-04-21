import EventEntity from "./entity/EventEntity"
import { getManager } from "typeorm"
import EventService from "./services/EventService"
import cron from 'node-cron'
import { CronJobInterval } from "./utils/cronHelper"
import dayjs from "dayjs"

cron.schedule(
  CronJobInterval.EVERY_DAY_4_AM,
  async () => {
    try {
      const dateStart = dayjs().locale("fr").format("YYYY-MM-DD")
      console.warn(`Sarting update event status at ${dateStart}`)
      const events = await getManager().find(EventEntity)
      console.log(events.length, 'events')
      if (events.length > 0) {
        await Promise.all(events.map(event => EventService.getNumberSignatureNeededForEvent(event.id)))
        await Promise.all(events.map(event => EventService.updateStatusEventWhenCompleted(event)))
        await EventService.updateStatusForEventArray(events)
      }

    } catch (error) {
      console.error(error, 'error')
    } finally {
      const dateEnd = dayjs().locale("fr").format("YYYY-MM-DD")
      console.warn(`update event status ended at ${dateEnd}`)
    }
  }
)
