import { Router } from 'express'
import EmployeeController from '../controllers/EmployeeController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()

router.post('/', [isAuthenticated], EmployeeController.createOne)

router.post('/many', [isAuthenticated], EmployeeController.createMany)

router.post('/manyonevent/:eventId', [isAuthenticated], EmployeeController.createManyEmployeeByEventId)

router.get('/:id', [isAuthenticated], EmployeeController.getOne)

router.get('/many/', [isAuthenticated], EmployeeController.getMany)

router.get('/', [isAuthenticated], EmployeeController.getAll)

router.get('/user/:id', [isAuthenticated], EmployeeController.getManyByUserId)

router.get('/event/:id', [isAuthenticated], EmployeeController.getManyByEventId)

router.patch('/:id', [isAuthenticated], EmployeeController.updateOne)

router.delete('/:id', [isAuthenticated], EmployeeController.deleteOne)

router.delete('/many', [isAuthenticated], EmployeeController.deleteMany)

// router.get('/clear', EventController.clear)

export default router