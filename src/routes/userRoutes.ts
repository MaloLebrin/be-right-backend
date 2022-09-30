import { Router } from 'express'
import UserController from '../controllers/UserController'
import { Role } from '../types/Role'
import { checkUserRole, isAuthenticated, useEmailValidation } from '@/middlewares'

const router = Router()

const { body, isEmail } = useEmailValidation()

router.get('/many', [isAuthenticated], UserController.getMany)

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], UserController.getAll)

router.get('/:id', UserController.getOne)

router.get('/partners/:id', [isAuthenticated], UserController.getPhotographerAlreadyWorkWith)

router.post('/token', UserController.getOneByToken)

router.post('/', UserController.newUser)

router.post('/login', UserController.login)

router.post('/photographer', UserController.createPhotographer)

router.post('/isMailAlreadyExist', [body, isEmail], UserController.isMailAlreadyUsed)

router.patch('/:id', [isAuthenticated], UserController.updateOne)

router.patch('/theme/:id', [isAuthenticated], UserController.updateTheme)

router.delete('/:id', [isAuthenticated], UserController.deleteOne)

router.patch('/subscription/:id', [checkUserRole(Role.ADMIN)], UserController.updatesubscription)

// router.get('/clear', UserController.clear)

export default router
