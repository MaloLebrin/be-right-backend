import cloudinary from 'cloudinary'
import { FileEntity } from "../entity/FileEntity"
import { getManager } from 'typeorm'
import { UserEntity } from '../entity'
import { FileTypeEnum } from '../types/File'
import { getfullUsername } from '../utils/userHelper'

export default class FileService {

  public static async deleteFile(fileId: number) {
    const doc = await getManager().findOne(FileEntity, fileId)
    if (doc) {
      await cloudinary.v2.uploader.destroy(doc.public_id)
      const deleted = await getManager().delete(FileEntity, fileId)
      return deleted
    }
  }

  public static async deleteManyfiles(fileIds: number[]) {
    await Promise.all(fileIds.map(fileId => this.deleteFile(fileId)))
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

  public static async getFilesByType(type: FileTypeEnum) {
    const docs = await getManager().find(FileEntity, {
      where: {
        type
      },
      relations: ["createdByUser"]
    })
    return docs.map(doc => {
      const user = doc.createdByUser as unknown as UserEntity
      return {
        ...doc,
        createdByUser: user.id,
      }
    })
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

  public static async createProfilePicture(file: Express.Multer.File, user: UserEntity) {
    const existProfilePicture = await getManager().findOne(FileEntity, { createdByUser: user.id, type: FileTypeEnum.PROFILE_PICTURE })
    const userToSave = await getManager().findOne(UserEntity, user.id)

    if (existProfilePicture) {
      userToSave.profilePicture = null
      await getManager().save(userToSave)
      await this.deleteFile(existProfilePicture.id)
    }

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: `beright-${process.env.NODE_ENV}/user-${user.id}-${user.firstName}-${user.lastName}/${FileTypeEnum.PROFILE_PICTURE}`,
    })

    const picture = {
      fileName: file.filename,
      name: `Photo de profile de ${getfullUsername(user)}`,
      description: `Photo de profile de ${getfullUsername(user)}`,
      createdByUser: user.id,
      type: FileTypeEnum.PROFILE_PICTURE,
      url: result.url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      size: file.size,
      width: result.width,
      height: result.height,
      format: result.format,
      original_filename: result.original_filename,
      signature: result.signature,
      mimeType: file.mimetype,
    }
    const fileUploaded = getManager().create(FileEntity, picture)
    if (fileUploaded) {
      userToSave.profilePicture = fileUploaded
      await getManager().save([fileUploaded, userToSave])
      return fileUploaded
    }
  }

  public static async createLogo(file: Express.Multer.File, user: UserEntity) {
    const existLogos = await getManager().find(FileEntity, { createdByUser: user.id, type: FileTypeEnum.LOGO })

    if (existLogos.length > 0) {
      const logosIds = existLogos.map(logo => logo.id)
      await this.deleteManyfiles(logosIds)
    }
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: `beright-${process.env.NODE_ENV}/user-${user.id}-${user.firstName}-${user.lastName}/${FileTypeEnum.LOGO}`,
    })

    const picture = {
      fileName: file.filename,
      name: `Logo de ${getfullUsername(user)}`,
      description: `Logo de ${getfullUsername(user)}`,
      createdByUser: user.id,
      type: FileTypeEnum.LOGO,
      url: result.url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      size: file.size,
      width: result.width,
      height: result.height,
      format: result.format,
      original_filename: result.original_filename,
      signature: result.signature,
      mimeType: file.mimetype,
    }
    const fileUploaded = getManager().create(FileEntity, picture)
    if (fileUploaded) {
      await getManager().save(fileUploaded)
      return fileUploaded
    }
  }
}
