import { Router } from 'express'
import NewsletterController from '../controllers/NewsletterController'
import { Role } from '../types/Role'
import { checkUserRole, isAuthenticated, useValidation } from '../middlewares'

const router = Router()

const {
  idParamsSchema,
  emailAlreadyExistSchema,
  validate,
} = useValidation()

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], NewsletterController.getAllPaginate)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], NewsletterController.deleteOne)

router.post('/', [validate(emailAlreadyExistSchema)], NewsletterController.createOne)

export default router
