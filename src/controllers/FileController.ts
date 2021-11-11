import cloudinary from 'cloudinary'
import { FileEntity } from "../entity/FileEntity"
import { Request, Response } from "express"
import { getManager } from "typeorm"
export default class FileController {

	public static newFile = async (req: Request, res: Response) => {
		try {
			console.log(req.file, 'file')
			const fileRecieved = req.file
			const { name, description, user, event, employee }:
				{ name: string, description: string, user?: number, event?: number, employee?: number } = req.body


			console.log(req.body, 'req.body')
			const result = await cloudinary.v2.uploader.upload(fileRecieved.path, {
				folder: `beright/imageRight/user-${user}`
			})
			console.log(result, 'result')
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
			console.log(fileToPost, 'fileToPost')

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
}