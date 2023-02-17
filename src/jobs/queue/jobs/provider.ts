import { plainToInstance } from 'class-transformer'
import type { JobImp } from './job.definition'
import { UpdateEventStatusJob } from './updateEventStatus.job'

export const JobDictonary = new Map([
  [UpdateEventStatusJob.name, UpdateEventStatusJob],
])

export const getJobInstance = (data: JobImp): JobImp => {
  const jobClass = JobDictonary.get(data.name)
  if (jobClass) {
    return plainToInstance(jobClass, data)
  }
  return null
}
