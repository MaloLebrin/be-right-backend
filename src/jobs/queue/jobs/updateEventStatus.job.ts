import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import { useLogger } from '../../../middlewares/loggerService'
import EventService from '../../../services/EventService'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class UpdateEventStatusJob extends BaseJob implements JobImp {
  constructor(public payoad: Record<string, unknown>) {
    super()
  }

  handle = async () => {
    const eventService = new EventService(APP_SOURCE)
    const { eventId } = this.payoad
    const event = await eventService.getOneEvent(eventId as number)

    if (event) {
      useLogger().logger.info(event, 'event')
      await eventService.getNumberSignatureNeededForEvent(event.id)
      await eventService.updateStatusEventWhenCompleted(event)
      await eventService.updateStatusForEventArray([event])
    }
  }

  failed = (job: Job) => {
    useLogger().logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
