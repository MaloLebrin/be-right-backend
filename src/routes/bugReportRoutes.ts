import { Router } from 'express'
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import BugReportController from '../controllers/BugReportController'
import isAuthenticated from '../middlewares/IsAuthenticated'
import { useValidation } from '../middlewares'

const router = Router()

const {
  idParamsSchema,
  createbugSchema,
  validate,
} = useValidation()

router.get('/', [isAuthenticated], BugReportController.getAll)

router.get('/:id', [
  validate(idParamsSchema),
  isAuthenticated,
  checkUserRole(Role.ADMIN),
], BugReportController.getOne)

router.post('/', [validate(createbugSchema), isAuthenticated], BugReportController.createOne)

router.patch('/:id', [
  validate(idParamsSchema),
  isAuthenticated,
  checkUserRole(Role.ADMIN),
], BugReportController.updateOne)

router.patch('/status/:id', [
  validate(idParamsSchema),
  isAuthenticated,
  checkUserRole(Role.ADMIN),
], BugReportController.updateStatus)

router.delete('/:id', [
  validate(idParamsSchema),
  isAuthenticated,
  checkUserRole(Role.ADMIN),
], BugReportController.deleteOne)

export default router
