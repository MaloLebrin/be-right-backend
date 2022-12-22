import cloudinary from 'cloudinary'
import type { Request, Response } from 'express'
import type { FindOptionsWhere } from 'typeorm'
import { FileEntity, filesSearchableFields } from '../entity/FileEntity'
import { paginator, wrapperRequest } from '../utils'
import FileService from '../services/FileService'
import type { FileTypeEnum } from '../types/File'
import Context from '../context'
import { Role } from '../types/Role'
import { UserEntity } from '../entity'
import { useEnv } from '../env'
import { APP_SOURCE } from '..'

export default class FileController {
  static getManager = APP_SOURCE.manager

  static repository = APP_SOURCE.getRepository(FileEntity)

  public static newFile = async (req: Request, res: Response) => {
    const { NODE_ENV } = useEnv()

    await wrapperRequest(req, res, async () => {
      const fileRecieved = req.file
      const { name, description, event, employee, type }:
      { name: string; description: string; event?: number; employee?: number; type: FileTypeEnum } = req.body

      const ctx = Context.get(req)

      let userId = null

      let user = ctx.user
      if (user.roles === Role.ADMIN) {
        if (req.params.id) {
          userId = parseInt(req.params.id)
          user = await this.getManager.findOne(UserEntity, userId)
        } else {
          userId = user.id
        }
      } else {
        userId = user.id
      }

      const result = await cloudinary.v2.uploader.upload(fileRecieved.path, {
        folder: `beright-${NODE_ENV}/user-${userId}-${user.firstName}-${user.lastName}/${type}`,
      })

      const fileToPost = {
        fileName: fileRecieved.filename,
        name,
        description,
        createdByUser: userId,
        event,
        employee,
        type,
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

      const file = this.repository.create(fileToPost)
      await this.repository.save(file)
      return res.status(200).json(file)
    })
  }

  public static createProfilePicture = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const fileRecieved = req.file
      if (fileRecieved) {
        const ctx = Context.get(req)
        const profilePicture = await FileService.createProfilePicture(fileRecieved, ctx.user)
        return res.status(200).json(profilePicture)
      }
      return res.status(422).json({ error: 'fichier non envoyé' })
    })
  }

  public static createLogo = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const fileRecieved = req.file
      if (fileRecieved) {
        const ctx = Context.get(req)
        const logo = await FileService.createLogo(fileRecieved, ctx.user)
        return res.status(200).json(logo)
      }
      return res.status(422).json({ error: 'fichier non envoyé' })
    })
  }

  /**
   * @param file file: Partial<FileEntity>
   * @returns return file just updated
   */
  public static updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { file }: { file: Partial<FileEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const fileUpdated = await FileService.updateFile(id, file as FileEntity)
        return res.status(200).json(fileUpdated)
      }
      return res.status(422).json({ message: 'identitfiant du fichier manquant' })
    })
  }

  public static getFile = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const file = await FileService.getFile(id)
        if (file) {
          return res.status(200).json(file)
        } else {
          return res.status(400).json({ message: 'fichier non trouvé' })
        }
      }
      return res.status(422).json({ message: 'identitfiant du fichier manquant' })
    })
  }

  public static getFiles = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { ids }: { ids: number[] } = req.body
      const files = await Promise.all(ids.map(id => FileService.getFile(id)))
      return res.status(200).json(files)
    })
  }

  public static getFilesByUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const userId = parseInt(req.params.id)
      if (userId) {
        const files = await FileService.getFilesByUser(userId)
        return res.status(200).json(files)
      }
      return res.status(422).json({ message: 'Identifiant de l\'utilisateur manquant' })
    })
  }

  public static getFilesByEvent = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const eventId = parseInt(req.params.id)
      if (eventId) {
        const files = await FileService.getFilesByEvent(eventId)
        return res.status(200).json(files)
      }
      return res.status(422).json({ message: 'Identifiant de l\'événement manquant' })
    })
  }

  public static getFilesByEmployee = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const employeeId = parseInt(req.params.id)
      if (employeeId) {
        const files = await this.repository.find({ where: { employee: employeeId } })
        return res.status(200).json(files)
      }
      return res.status(422).json({ message: 'Identifiant de l\'employé manquant' })
    })
  }

  public static getFilesByUserAndEvent = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const userId = parseInt(req.params.userId)
      const eventId = parseInt(req.params.eventId)
      if (userId && eventId) {
        const files = await this.repository.find({ where: { createdByUser: userId, event: eventId } })
        if (files.length > 0) {
          return res.status(200).json(files)
        }
        return res.status(200).json({ message: 'Files not found' })
      }
      return res.status(422).json({ message: 'Identifiant de l\'utilisateur ou de l\'événement manquant' })
    })
  }

  public static getAllPaginate = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, filesSearchableFields)
      const [files, count] = await this.repository.findAndCount({
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<FileEntity>,
        },
      })
      return res.status(200).json({ data: files, total: count, currentPage: queriesFilters.page, limit: queriesFilters.take })
    })
  }

  public static deleteFile = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const file = await FileService.getFile(id)
        if (file) {
          await cloudinary.v2.uploader.destroy(file.public_id)
          const deleted = await FileService.deleteFile(id)
          return deleted ? res.status(204).json({ message: 'File deleted successfully' }) : res.status(400).json({ message: 'fichier non trouvé' })
        }
      }
      return res.status(422).json({ message: 'Identifiant du fichier manquant' })
    })
  }
  // TODO add update file
}
