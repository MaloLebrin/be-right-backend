import { Router } from 'express'
import multer from 'multer'
import FileController from '../controllers/FileController'
import { isAuthenticated, useValidation } from '../middlewares'

const upload = multer({ dest: 'uploads/' })

const router = Router()

const {
  idParamsSchema,
  validate,
} = useValidation()

router.post('/profile', [isAuthenticated], upload.single('file'), FileController.createProfilePicture)

router.post('/logo', [isAuthenticated], upload.single('file'), FileController.createLogo)

router.post('/:id', [isAuthenticated], upload.single('file'), FileController.newFile)

router.patch('/:id', [isAuthenticated], FileController.updateOne)

router.get('/', [isAuthenticated], FileController.getAllPaginate)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], FileController.getFile)

router.get('/many', [isAuthenticated], FileController.getFiles)

router.get('/user/:id', [isAuthenticated], FileController.getFilesByUser)

router.get('/event/:id', [isAuthenticated], FileController.getFilesByEvent)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], FileController.deleteFile)

export default router
