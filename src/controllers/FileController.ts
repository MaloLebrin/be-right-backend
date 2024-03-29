import cloudinary from 'cloudinary'
import type { NextFunction, Request, Response } from 'express'
import type { EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import { FileEntity } from '../entity/FileEntity'
import { wrapperRequest } from '../utils'
import FileService from '../services/FileService'
import { FileTypeEnum } from '../types/File'
import { Role } from '../types/Role'
import { useEnv } from '../env'
import { APP_SOURCE } from '..'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'

export default class FileController {
  getManager: EntityManager
  FileService: FileService
  repository: Repository<FileEntity>

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.FileService = new FileService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(FileEntity)
  }

  public newFile = async (req: Request, res: Response, next: NextFunction) => {
    const { NODE_ENV } = useEnv()

    await wrapperRequest(req, res, next, async ctx => {
      const fileRecieved = req.file
      const { name, description, event, employee, type }:
      { name: string; description: string; event?: number; employee?: number; type: FileTypeEnum } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
        quality: 'auto',
        fetch_format: 'auto',
      })

      const fileToPost = {
        fileName: fileRecieved.filename,
        name,
        description,
        createdByUser: userId,
        eventId: event,
        employeeId: employee,
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

  public createProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const fileRecieved = req.file

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (fileRecieved) {
        const profilePicture = await this.FileService.createProfilePicture(fileRecieved, ctx.user)
        return res.status(200).json(profilePicture)
      }

      throw new ApiError(422, 'fichier manquant')
    })
  }

  public createLogo = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const fileRecieved = req.file

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (fileRecieved) {
        const logo = await this.FileService.createLogo(fileRecieved, ctx.user)
        return res.status(200).json(logo)
      }
      throw new ApiError(422, 'fichier manquant')
    })
  }

  /**
   * @param file file: Partial<FileEntity>
   * @returns return file just updated
   */
  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { file }: { file: Partial<FileEntity> } = req.body
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (id) {
        const fileUpdated = await this.FileService.updateFile(id, file as FileEntity)
        return res.status(200).json(fileUpdated)
      }

      throw new ApiError(422, 'identitfiant du fichier manquant')
    })
  }

  public getFile = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const file = await this.FileService.getFile(id)
        if (file) {
          return res.status(200).json(file)
        } else {
          throw new ApiError(422, 'fichier non trouvé')
        }
      }
      throw new ApiError(422, 'identitfiant du fichier manquant')
    })
  }

  public getFiles = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { ids }: { ids: number[] } = req.body
      const files = await Promise.all(ids.map(id => this.FileService.getFile(id)))
      return res.status(200).json(files)
    })
  }

  public getFilesByUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const userId = parseInt(req.params.id)
      if (userId) {
        const files = await this.FileService.getFilesByUser(userId)
        return res.status(200).json(files)
      }

      throw new ApiError(422, 'identitfiant du fichier manquant')
    })
  }

  public getFilesByEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const eventId = parseInt(req.params.id)
      if (eventId) {
        const files = await this.FileService.getFilesByEvent(eventId)
        return res.status(200).json(files)
      }

      throw new ApiError(422, 'Identifiant de l\'événement manquant')
    })
  }

  public getFilesByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const employeeId = parseInt(req.params.id)
      if (employeeId) {
        const files = await this.repository.find({ where: { employeeId } })
        return res.status(200).json(files)
      }

      throw new ApiError(422, 'Identifiant de l\'employé manquant')
    })
  }

  public getFilesByUserAndEvent = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const eventId = parseInt(req.params.eventId)
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (ctx.user.companyId && eventId) {
        const files = await this.repository.find({ where: { company: { id: ctx.user.companyId }, eventId } })

        return res.status(200).json(files)
      }

      throw new ApiError(422, 'Identifiant de l\'utilisateur ou de l\'événement manquant')
    })
  }

  public getProfilePictures = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const urls = req.body.urls

      if (urls && urls.length > 0) {
        const files = await this.repository.find({
          where: {
            secure_url: In(urls),
            type: FileTypeEnum.PROFILE_PICTURE,
          },
        })

        return res.status(200).json(files)
      }

      throw new ApiError(422, 'Urls des photos manquantes')
    })
  }

  public deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const file = await this.FileService.getFile(id)
        if (file) {
          await cloudinary.v2.uploader.destroy(file.public_id)
          const deleted = await this.FileService.deleteFile(id)

          if (deleted) {
            return res.status(204).json({ message: 'Fichier Supprimé' })
          }
          throw new ApiError(422, 'fichier non supprimé')
        }
        throw new ApiError(422, 'fichier n\'éxiste pas')
      }
      throw new ApiError(422, 'identitfiant du fichier manquant')
    })
  }
}
