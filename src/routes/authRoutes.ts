import { Router } from 'express'
import { useValidation } from '../middlewares'
import AuthController from '../controllers/AuthController'

const router = Router()

const {
  emailAlreadyExistSchema,
  resetPasswordSchema,
  validate,
} = useValidation()

router.post('/forgot-password', [validate(emailAlreadyExistSchema)], AuthController.forgotPassword)

router.post('/reset-password', [validate(resetPasswordSchema)], AuthController.resetPassword)

export default router
