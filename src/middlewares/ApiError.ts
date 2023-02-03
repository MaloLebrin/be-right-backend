import type { Response } from 'express'

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }

  public Handler = async (res: Response) => {
    return res.status(this.statusCode || 500).send({
      success: false,
      message: this.message,
      stack: this.stack,
    })
  }
}

export class NotFoundError extends ApiError {
  constructor(path: string) {
    super(404, `The requested path ${path} not found!`)
  }
}
