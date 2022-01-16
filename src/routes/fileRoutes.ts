import { Router } from 'express'
import FileController from '../controllers/FileController'
import multer from "multer"
import isAuthenticated from '../middlewares/IsAuthenticated'
const upload = multer({ dest: "uploads/" })

const router = Router()

router.post('/', [isAuthenticated], upload.single('file'), FileController.newFile)

router.get('/', [isAuthenticated], FileController.getAllPaginate)

router.get('/:id', [isAuthenticated], FileController.getFile)

router.get('/many', [isAuthenticated], FileController.getFiles)

router.get('/user/:id', [isAuthenticated], FileController.getFilesByUser)

router.get('/event/:id', [isAuthenticated], FileController.getFilesByEvent)

router.delete('/:id', [isAuthenticated], FileController.deleteFile)

export default router