import { Router } from 'express'
import NewsletterController from '../controllers/NewsletterController'
import checkUserRole from '../middlewares/checkUserRole'
import isAuthenticated from '../middlewares/IsAuthenticated'
import { Role } from '../types/Role'
const router = Router()

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], NewsletterController.getAllPaginate)

router.delete('/:id', NewsletterController.deleteOne)

router.post('/', NewsletterController.createOne)

export default router