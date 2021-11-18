import cloudinary from 'cloudinary'
import { FileEntity, filesSearchableFields } from "../entity/FileEntity"
import { Request, Response } from "express"
import { getManager } from "typeorm"
import { paginator } from '../utils'
import FileService from '../services/FileService'
export default class FileController {

	public static newFile = async (req: Request, res: Response) => {
		try {
			const fileRecieved = req.file
			const { name, description, user, event, employee }:
				{ name: string, description: string, user?: number, event?: number, employee?: number } = req.body

			const result = await cloudinary.v2.uploader.upload(fileRecieved.path, {
				folder: `beright/imageRight/user-${user}`
			})

			const fileToPost = {
				fileName: fileRecieved.filename,
				name,
				description,
				user,
				event,
				employee,
				url: result.url,
				public_id: result.public_id,
				secure_url: result.secure_url,
				size: fileRecieved.size,
				width: result.width,
				height: result.height,
				format: result.format,
				original_filename: result.original_filename,
				signature: result.signature,
				mimeType: fileRecieved.mimetype,
			}

			const file = getManager().create(FileEntity, fileToPost)
			await getManager().save(file)

			if (file) {
				return res.status(200).json({
					message: 'File uploaded successfully',
					file
				})
			} else {
				return res.status(400).json({ message: 'File not uploaded' })
			}
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFile = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const file = await getManager().findOne(FileEntity, id)
			if (file) {
				return res.status(200).json(file)
			} else {
				return res.status(400).json({ message: 'File not found' })
			}
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFiles = async (req: Request, res: Response) => {
		try {
			const { ids }: { ids: number[] } = req.body
			const files = await Promise.all(ids.map(id => getManager().findOne(FileEntity, id)))
			if (files.length > 0) {
				return res.status(200).json({ data: files, count: files.length })
			} else {
				return res.status(400).json({ message: 'Files not found' })
			}
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFilesByUser = async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.id)
			const files = await getManager().find(FileEntity, { where: { user: userId } })
			if (files.length > 0) {
				return res.status(200).json({ data: files, count: files.length })
			}
			return res.status(400).json({ message: 'Files not found' })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFilesByEvent = async (req: Request, res: Response) => {
		try {
			const eventId = parseInt(req.params.id)
			const files = await getManager().find(FileEntity, { where: { event: eventId } })
			if (files.length > 0) {
				return res.status(200).json({ data: files, count: files.length })
			}
			return res.status(400).json({ message: 'Files not found' })

		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFilesByEmployee = async (req: Request, res: Response) => {
		try {
			const employeeId = parseInt(req.params.id)
			const files = await getManager().find(FileEntity, { where: { employee: employeeId } })
			if (files.length > 0) {
				return res.status(200).json({ data: files, count: files.length })
			} else {
				return res.status(400).json({ message: 'Files not found' })
			}
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getFilesByUserAndEvent = async (req: Request, res: Response) => {
		try {
			const userId = parseInt(req.params.userId)
			const eventId = parseInt(req.params.eventId)
			const files = await getManager().find(FileEntity, { where: { user: userId, event: eventId } })
			if (files.length > 0) {
				return res.status(200).json({ data: files, count: files.length })
			}
			return res.status(400).json({ message: 'Files not found' })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static getAllPaginate = async (req: Request, res: Response) => {
		try {
			const queriesFilters = paginator(req, filesSearchableFields)
			const [files, count] = await getManager().findAndCount(FileEntity, queriesFilters)
			if (files.length > 0) {
				return res.status(200).json({ data: files, total: count, currentPage: queriesFilters.page, limit: queriesFilters.take })
			}
			return res.status(400).json({ message: 'Files not found' })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	public static deleteFile = async (req: Request, res: Response) => {
		try {
			const id = parseInt(req.params.id)
			const deleted = await FileService.deleteFile(id)
			return deleted ? res.status(204).json({ message: 'File deleted successfully' }) : res.status(400).json({ message: 'File not found' })
		} catch (error) {
			console.error(error)
			if (error.status) {
				return res.status(error.status).json({ error: error.message })
			}
			return res.status(400).json({ error: error.message })
		}
	}
	// TODO add update file and delte file
}