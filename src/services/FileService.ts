import cloudinary from 'cloudinary'
import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import { FileEntity } from '../entity/FileEntity'
import { UserEntity } from '../entity/UserEntity'
import { FileTypeEnum } from '../types/File'
import { getfullUsername } from '../utils/userHelper'
import { useEnv } from '../env'

export default class FileService {
  getManager: EntityManager

  repository: Repository<FileEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(FileEntity)
    this.getManager = APP_SOURCE.manager
  }

  async deleteFile(fileId: number) {
    const doc = await this.getFile(fileId)
    if (doc) {
      await cloudinary.v2.uploader.destroy(doc.public_id)
      const deleted = await this.repository.delete(fileId)
      return deleted
    }
  }

  async deleteManyfiles(fileIds: number[]) {
    await Promise.all(fileIds.map(fileId => this.deleteFile(fileId)))
  }

  async getFile(fileId: number) {
    const doc = await this.repository.findOne({
      where: {
        id: fileId,
      },
      relations: ['createdByUser'],
    })
    return doc
  }

  async getManyFiles(ids: number[]) {
    const docs = await this.repository.find({
      where: {
        id: In(ids),
      },
    })
    return docs
  }

  async getFilesByUser(id: number) {
    const docs = await this.repository.find({
      where: {
        createdByUser: id,
      },
    })
    return docs
  }

  async getFilesByEvent(id: number) {
    const docs = await this.repository.find({
      where: {
        event: id,
      },
    })
    return docs
  }

  async getFilesByType(type: FileTypeEnum) {
    const docs = await this.repository.find({
      where: {
        type,
      },
      relations: ['createdByUser'],
    })
    return docs.map(doc => {
      const user = doc.createdByUser as unknown as UserEntity
      return {
        ...doc,
        createdByUser: user.id,
      }
    })
  }

  async updateFile(id: number, file: FileEntity) {
    const updatedfile = await this.getFile(id)
    if (!updatedfile) {
      return null
    }
    const fileToSave = {
      ...file,
      updatedAt: new Date(),
    }
    await this.repository.update(id, fileToSave)
    return this.getFile(id)
  }

  async createProfilePicture(file: Express.Multer.File, user: UserEntity) {
    const { NODE_ENV } = useEnv()

    const existProfilePicture = await this.repository.findOne({
      where: {
        createdByUser: user.id,
        type: FileTypeEnum.PROFILE_PICTURE,
      },
    })
    const userToSave = await this.getManager.findOne(UserEntity, { where: { id: user.id } })

    if (existProfilePicture) {
      userToSave.profilePicture = null
      await this.getManager.save(userToSave)
      await this.deleteFile(existProfilePicture.id)
    }

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: `beright-${NODE_ENV}/user-${user.id}-${user.firstName}-${user.lastName}/${FileTypeEnum.PROFILE_PICTURE}`,
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

    const fileUploaded = this.repository.create(picture)

    if (fileUploaded) {
      userToSave.profilePicture = fileUploaded
      await this.getManager.save([fileUploaded, userToSave])
      return fileUploaded
    }
  }

  async createLogo(file: Express.Multer.File, user: UserEntity) {
    const { NODE_ENV } = useEnv()

    const existLogos = await this.repository.find({
      where: {
        createdByUser: user.id,
        type: FileTypeEnum.LOGO,
      },
    })

    if (existLogos.length > 0) {
      const logosIds = existLogos.map(logo => logo.id)
      await this.deleteManyfiles(logosIds)
    }
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: `beright-${NODE_ENV}/user-${user.id}-${user.firstName}-${user.lastName}/${FileTypeEnum.LOGO}`,
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
    const fileUploaded = this.repository.create(picture)
    if (fileUploaded) {
      await this.repository.save(fileUploaded)
      return fileUploaded
    }
  }
}
