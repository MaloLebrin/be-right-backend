import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

export const logger = pino(
  {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
  // eslint-disable-next-line n/no-path-concat
  pino.destination(`${__dirname}/logger.log`),
)

export const loggerMiddleware = expressPinoLogger({
  logger: logger as any,
  autoLogging: true,
})
