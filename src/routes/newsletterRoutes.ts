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

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new NewsletterController().getAllPaginate)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new NewsletterController().deleteOne)

router.post('/', [validate(emailAlreadyExistSchema)], new NewsletterController().createOne)

export default router
