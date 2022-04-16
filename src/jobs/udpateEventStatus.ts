import EventEntity from "../entity/EventEntity"
import { getManager } from "typeorm"
import EventService from "../services/EventService"
import cron from 'node-cron'
import { CronJobInterval } from "../utils/cronHelper"

export async function udpateEventStatusJob() {
  cron.schedule(
    CronJobInterval.EVERY_DAY_4_AM,
    async () => {
      try {
        console.warn('Sarting update event status')
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
        console.warn('update event status ended')
      }
    }
  )
}
