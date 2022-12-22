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

router.get('/', [isAuthenticated], new EmployeeController().getAll)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getOne)

router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByUserId)

router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByEventId)

router.post('/:id', [validate(createEmployeeSchema), isAuthenticated], new EmployeeController().createOne)

router.post('/many/:id', [validate(createManyEmployeesSchema), isAuthenticated], new EmployeeController().createMany)

router.post('/manyonevent/:eventId/:id', [validate(createManyEmployeesOnEventSchema), isAuthenticated], new EmployeeController().createManyEmployeeByEventId)

router.put('/updateTotalSignatureNeeded/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().patchOne)

router.patch('/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().deleteOne)

export default router
