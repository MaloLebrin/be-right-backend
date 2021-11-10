import { Router } from 'express'
import EmployeeController from '../controllers/EmployeeController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()

router.get('/many/', [isAuthenticated], EmployeeController.getMany)

router.get('/', [isAuthenticated], EmployeeController.getAll)

router.get('/:id', [isAuthenticated], EmployeeController.getOne)

router.post('/', [isAuthenticated], EmployeeController.createOne)

router.get('/user/:id', [isAuthenticated], EmployeeController.getManyByUserId)

router.get('/event/:id', [isAuthenticated], EmployeeController.getManyByEventId)

router.patch('/:id', [isAuthenticated], EmployeeController.updateOne)

router.delete('/:id', [isAuthenticated], EmployeeController.deleteOne)

// router.get('/clear', EventController.clear)

export default router