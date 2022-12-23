import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import EventEntity from '../entity/EventEntity'
import EventService from '../services/EventService'

export default async function udpateEventStatusJob(APP_SOURCE: DataSource) {
  try {
    const dateStart = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    console.warn(`Sarting update event status at ${dateStart}`)

    const eventService = new EventService(APP_SOURCE)

    const events = await APP_SOURCE.manager.find(EventEntity)
    console.info(events.length, 'events')

    if (events.length > 0) {
      await Promise.all(events.map(event => eventService.getNumberSignatureNeededForEvent(event.id)))
      await Promise.all(events.map(event => eventService.updateStatusEventWhenCompleted(event)))
      await eventService.updateStatusForEventArray(events)
    }
  } catch (error) {
    console.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    console.warn(`update event status ended at ${dateEnd}`)
  }
}
