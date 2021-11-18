import cloudinary from 'cloudinary'
import { FileEntity } from "@/entity/FileEntity"
import { getManager } from 'typeorm'

export default class FileService {


	public static async deleteFile(fileId: number) {
		const doc = await getManager().findOne(FileEntity, fileId)
		if (doc) {
			await cloudinary.v2.uploader.destroy(doc.public_id)
			const deleted = await getManager().delete(FileEntity, fileId)
			return deleted
		}
	}

	public static async getFile(fileId: number) {
		const doc = await getManager().findOne(FileEntity, fileId)
		return doc
	}

	public static async getManyFiles(ids: number[]) {
		const docs = await getManager().findByIds(FileEntity, ids)
		return docs
	}

	public static async getFilesByUser(id: number) {
		const docs = await getManager().find(FileEntity, {
			where: {
				user: id
			}
		})
		return docs
	}

	public static async getFilesByEvent(id: number) {
		const docs = await getManager().find(FileEntity, {
			where: {
				event: id
			}
		})
		return docs
	}
}