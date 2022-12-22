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

router.post('/profile', [isAuthenticated], upload.single('file'), new FileController().createProfilePicture)

router.post('/logo', [isAuthenticated], upload.single('file'), new FileController().createLogo)

router.post('/:id', [isAuthenticated], upload.single('file'), new FileController().newFile)

router.patch('/:id', [isAuthenticated], new FileController().updateOne)

router.get('/', [isAuthenticated], new FileController().getAllPaginate)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], new FileController().getFile)

router.get('/many', [isAuthenticated], new FileController().getFiles)

router.get('/user/:id', [isAuthenticated], new FileController().getFilesByUser)

router.get('/event/:id', [isAuthenticated], new FileController().getFilesByEvent)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new FileController().deleteFile)

export default router
