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
import {
  ApiError,
  AuthorizationError,
  DatabaseError,
  ExternalServiceError,
  NotFoundError,
  ValidationError,
} from '../middlewares/ApiError'

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
      if (!ctx) {
        throw new DatabaseError('Contexte de requête manquant')
      }

      const fileRecieved = req.file
      const { name, description, event, employee, type } = req.body

      if (!fileRecieved) {
        throw new ValidationError('Aucun fichier reçu', { field: 'file' })
      }

      if (!name || !type) {
        throw new ValidationError('Nom et type de fichier requis', {
          fields: { name: !name, type: !type },
        })
      }

      const company = ctx.user.company
      if (!company) {
        throw new NotFoundError('Entreprise', { userId: ctx.user.id })
      }

      let userId = null
      let user = ctx.user

      if (user.roles === Role.ADMIN) {
        if (req.params.id) {
          userId = parseInt(req.params.id)
          user = await this.getManager.findOne(UserEntity, userId)
          if (!user) {
            throw new NotFoundError('Utilisateur', { id: userId })
          }
        } else {
          userId = user.id
        }
      } else {
        userId = user.id
      }

      const result = await cloudinary.v2.uploader.upload(fileRecieved.path, {
        folder: `beright-${NODE_ENV}/company-${company.id}/${type}`,
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
      if (!ctx) {
        throw new DatabaseError('Contexte de requête manquant')
      }

      const fileReceived = req.file
      if (!fileReceived) {
        throw new ValidationError('Aucun fichier reçu', { field: 'file' })
      }

      const company = ctx.user.company
      if (!company) {
        throw new NotFoundError('Entreprise', { userId: ctx.user.id })
      }

      try {
        const profilePicture = await this.FileService.createProfilePicture(fileReceived, ctx.user, company)
        res.status(201).json(profilePicture)
      } catch (error) {
        if (error instanceof Error && error.message.includes('cloudinary')) {
          throw new ExternalServiceError('Cloudinary', 'Erreur lors de l\'upload de la photo de profil')
        }
        throw new DatabaseError('Erreur lors de la création de la photo de profil')
      }
    })
  }

  public createLogo = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new DatabaseError('Contexte de requête manquant')
      }

      const fileReceived = req.file
      if (!fileReceived) {
        throw new ValidationError('Aucun fichier reçu', { field: 'file' })
      }

      if (ctx.user.roles !== Role.ADMIN) {
        throw new AuthorizationError('Seul un administrateur peut créer un logo')
      }

      const company = ctx.user.company
      if (!company) {
        throw new NotFoundError('Entreprise', { userId: ctx.user.id })
      }

      try {
        const logo = await this.FileService.createLogo(fileReceived, company)
        res.status(201).json(logo)
      } catch (error) {
        if (error instanceof Error && error.message.includes('cloudinary')) {
          throw new ExternalServiceError('Cloudinary', 'Erreur lors de l\'upload du logo')
        }
        throw new DatabaseError('Erreur lors de la création du logo')
      }
    })
  }

  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new DatabaseError('Contexte de requête manquant')
      }

      const { id } = req.params
      const { name, description } = req.body

      if (!id) {
        throw new ValidationError('ID du fichier manquant', { field: 'id' })
      }

      const file = await this.FileService.getFile(parseInt(id))
      if (!file) {
        throw new NotFoundError('Fichier', { id })
      }

      try {
        const updatedFile = await this.FileService.updateFile(parseInt(id), {
          ...file,
          name,
          description,
        })
        res.status(200).json(updatedFile)
      } catch (error) {
        throw new DatabaseError('Erreur lors de la mise à jour du fichier')
      }
    })
  }

  public getFile = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new DatabaseError('Contexte de requête manquant')
      }

      const { id } = req.params
      if (!id) {
        throw new ValidationError('ID du fichier manquant', { field: 'id' })
      }

      const file = await this.FileService.getFile(parseInt(id))
      if (!file) {
        throw new NotFoundError('Fichier', { id })
      }

      res.status(200).json(file)
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

      if (!id) {
        throw new ValidationError('ID du fichier manquant', { field: 'id' })
      }

      const file = await this.FileService.getFile(id)
      if (!file) {
        throw new NotFoundError('Fichier', { id })
      }

      await cloudinary.v2.uploader.destroy(file.public_id)
      const deleted = await this.FileService.deleteFile(id)

      if (deleted) {
        return res.status(204).json({ message: 'Fichier Supprimé' })
      }
      throw new ApiError(500, 'fichier non supprimé')
    })
  }
}
