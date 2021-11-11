import { Router } from 'express'
import UserController from '@/controllers/UserController'
import checkUserRole from '@/middlewares/checkUserRole'
import isAuthenticated from '@/middlewares/IsAuthenticated'
import { Role } from '@/types/Role'
const router = Router()

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], UserController.getAll)

router.get('/:id', UserController.getOne)

router.post('/', UserController.newUser)

router.post('/login', UserController.login)

router.patch('/:id', [isAuthenticated], UserController.updateOne)

router.delete('/:id', [isAuthenticated], UserController.deleteOne)

router.patch('/subscription/:id', [checkUserRole(Role.ADMIN)], UserController.updatesubscription)

// router.get('/clear', UserController.clear)

export default router