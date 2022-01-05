import { Router } from 'express'
import EmployeeController from '../controllers/EmployeeController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()


router.get('/', [isAuthenticated], EmployeeController.getAll)

router.get('/:id', [isAuthenticated], EmployeeController.getOne)

router.get('/user/:id', [isAuthenticated], EmployeeController.getManyByUserId)

router.get('/event/:id', [isAuthenticated], EmployeeController.getManyByEventId)

router.post('/:id', [isAuthenticated], EmployeeController.createOne)

router.post('/many', [isAuthenticated], EmployeeController.createMany)

router.post('/manyonevent/:eventId/:userId', [isAuthenticated], EmployeeController.createManyEmployeeByEventId)

router.put('/updateTotalSignatureNeeded/:id', [isAuthenticated], EmployeeController.patchOne)

router.patch('/:id', [isAuthenticated], EmployeeController.updateOne)

router.delete('/:id', [isAuthenticated], EmployeeController.deleteOne)

// router.delete('/deletemany', [isAuthenticated], EmployeeController.deleteMany)

// router.get('/clear', EventController.clear)

export default router