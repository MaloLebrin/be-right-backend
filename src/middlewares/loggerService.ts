import { Logger } from 'tslog'

export const logger = new Logger<{
  name: string
}>({
  name: 'app',
})
