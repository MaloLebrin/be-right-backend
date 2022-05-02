import EventEntity from "../entity/EventEntity"
import EventService from "../services/EventService"
import dayjs from "dayjs"
import { getManager } from "typeorm"

export default async function udpateEventStatusJob() {
  try {
    const dateStart = dayjs().locale("fr").format("YYYY-MM-DD-HH-mm")
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
    const dateEnd = dayjs().locale("fr").format("YYYY-MM-DD-HH-mm")
    console.warn(`update event status ended at ${dateEnd}`)
  }
}
