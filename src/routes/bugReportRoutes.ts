import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import { Router } from 'express'
import BugReportController from '../controllers/BugReportController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.getAll)

router.get('/:id', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.getOne)

router.post('/', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.createOne)

router.patch('/:id', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.updateOne)

router.patch('/status/:id', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.updateStatus)

router.delete('/:id', [isAuthenticated, checkUserRole(Role.ADMIN)], BugReportController.deleteOne)

export default router