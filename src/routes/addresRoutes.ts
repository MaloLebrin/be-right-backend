import { AddresController } from '../controllers/AddressController'
import { Router } from 'express'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

router.get('/:id', isAuthenticated, AddresController.getOne)

router.get('/event/:id', isAuthenticated, AddresController.getOneByEvent)

router.get('/user/:id', isAuthenticated, AddresController.getOneByUser)

router.get('/employee/:id', isAuthenticated, AddresController.getOneByEmployee)

router.post('/', isAuthenticated, AddresController.createOne)

router.patch('/', isAuthenticated, AddresController.updateOne)

router.delete('/:id', isAuthenticated, AddresController.deleteOne)

export default router
