import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

export function useLogger() {
  const logger = pino(
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

  const loggerMiddleware = expressPinoLogger({
    logger,
    autoLogging: true,
  })

  return {
    loggerMiddleware,
    logger,
  }
}
