import cloudinary from 'cloudinary'
import { FileEntity } from "../entity/FileEntity"
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
		const doc = await getManager().findOne(FileEntity, fileId, { relations: ["createdByUser"] })
		return doc
	}

	public static async getManyFiles(ids: number[]) {
		const docs = await getManager().findByIds(FileEntity, ids)
		return docs
	}

	public static async getFilesByUser(id: number) {
		const docs = await getManager().find(FileEntity, {
			where: {
				createdByUser: id
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

	public static async updateFile(id: number, file: FileEntity) {
		const updatedfile = await getManager().findOne(FileEntity, id)
		if (!updatedfile) {
			return null
		}
		const fileToSave = {
			...file,
			updatedAt: new Date(),
		}
		await getManager().update(FileEntity, id, fileToSave)
		return this.getFile(id)

	}
}