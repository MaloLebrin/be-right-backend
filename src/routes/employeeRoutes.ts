import { Router } from 'express'
import { useValidation } from '../middlewares'
import EmployeeController from '../controllers/EmployeeController'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

const {
  idParamsSchema,
  createEmployeeSchema,
  createManyEmployeesSchema,
  createManyEmployeesOnEventSchema,
  validate,
} = useValidation()

router.get('/', [isAuthenticated], EmployeeController.getAll)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.getOne)

router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.getManyByUserId)

router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.getManyByEventId)

router.post('/:id', [validate(createEmployeeSchema), isAuthenticated], EmployeeController.createOne)

router.post('/many/:id', [validate(createManyEmployeesSchema), isAuthenticated], EmployeeController.createMany)

router.post('/manyonevent/:eventId/:id', [validate(createManyEmployeesOnEventSchema), isAuthenticated], EmployeeController.createManyEmployeeByEventId)

router.put('/updateTotalSignatureNeeded/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.patchOne)

router.patch('/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], EmployeeController.deleteOne)

export default router
