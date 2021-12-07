import { Router } from 'express'
import FileController from '../controllers/FileController'
import multer from "multer"
const upload = multer({ dest: "uploads/" })

const router = Router()

router.post('/', upload.single('file'), FileController.newFile)

router.get('/', FileController.getAllPaginate)

router.get('/:id', FileController.getFile)

router.get('/many', FileController.getFiles)

router.get('/user/:id', FileController.getFilesByUser)

router.get('/event/:id', FileController.getFilesByEvent)

router.delete('/:id', FileController.deleteFile)

export default router