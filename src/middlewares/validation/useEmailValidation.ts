import type { NextFunction, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'

export function useEmailValidation() {
  function isEmail(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array({

        }),
      })
    }
    return next()
  }

  return {
    isEmail,
    body: body('email').isEmail(),
  }
}
