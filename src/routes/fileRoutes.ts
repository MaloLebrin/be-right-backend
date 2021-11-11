import { Router } from 'express'
import FileController from '../controllers/FileController'
import multer from "multer"
const upload = multer({ dest: "uploads/" })

const router = Router()

router.post('/', upload.single('file'), FileController.newFile)

export default router