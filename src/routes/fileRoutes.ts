import { Router } from 'express'
import multer from 'multer'
import FileController from '../controllers/FileController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const upload = multer({ dest: 'uploads/' })

const router = Router()

router.post('/profile', [isAuthenticated], upload.single('file'), FileController.createProfilePicture)

router.post('/logo', [isAuthenticated], upload.single('file'), FileController.createLogo)

router.post('/:id', [isAuthenticated], upload.single('file'), FileController.newFile)

router.patch('/:id', [isAuthenticated], FileController.updateOne)

router.get('/', [isAuthenticated], FileController.getAllPaginate)

router.get('/:id', [isAuthenticated], FileController.getFile)

router.get('/many', [isAuthenticated], FileController.getFiles)

router.get('/user/:id', [isAuthenticated], FileController.getFilesByUser)

router.get('/event/:id', [isAuthenticated], FileController.getFilesByEvent)

router.delete('/:id', [isAuthenticated], FileController.deleteFile)

export default router
