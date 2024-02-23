import type { NextFunction, Request, Response } from 'express'
import { isProduction } from '../utils/envHelper'
import { ApiError } from './ApiError'

export function errorHandler(err: Error, _: Request, res: Response, next: NextFunction) {
  // default HTTP status code and error message
  let httpStatusCode = 500
  let message = 'Internal Server Error'

  // if the error is a custom defined error
  if (err instanceof ApiError) {
    httpStatusCode = err.statusCode
    message = err.message
  } else {
    // hide the detailed error message in production
    // for security reasons
    if (isProduction()) {
      // since in JavaScript you can also
      // directly throw strings
      if (typeof err === 'string') {
        message = err
      } else if (err instanceof Error) {
        message = err.message
      }
    }
  }

  let stackTrace

  // return the stack trace only when
  // developing locally or in stage
  if (isProduction()) {
    stackTrace = err.stack
  }

  // logg the error
  console.error(err)
  // other custom behaviors...

  // return the standard error response
  res.status(httpStatusCode).send({
    error: {
      status: httpStatusCode,
      message,
      stackTrace,
    },
  })
  return next(err)
}
