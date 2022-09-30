import { Router } from 'express'
import { useValidation } from '../middlewares'
import { AddresController } from '../controllers/AddressController'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

const {
  idParamsSchema,
  createAddressSchema,
  validate,
} = useValidation()

router.get('/:id', [validate(idParamsSchema), isAuthenticated], AddresController.getOne)

router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], AddresController.getOneByEvent)

router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], AddresController.getOneByUser)

router.get('/employee/:id', [validate(idParamsSchema), isAuthenticated], AddresController.getOneByEmployee)

router.post('/', [validate(createAddressSchema), isAuthenticated], AddresController.createOne)

router.patch('/:id', [isAuthenticated], AddresController.updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], AddresController.deleteOne)

export default router
