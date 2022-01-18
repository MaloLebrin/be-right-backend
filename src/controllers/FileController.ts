import cloudinary from 'cloudinary'
import { FileEntity, filesSearchableFields } from "../entity/FileEntity"
import { Request, Response } from "express"
import { getManager } from "typeorm"
import { paginator } from '../utils'
import FileService from '../services/FileService'
import { FileTypeEnum } from '../types/File'
import Context from '../context'
import { Role } from '../types/Role'
import { UserEntity } from '../entity'
export default class FileController {

  public static newFile = async (req: Request, res: Response) => {
    try {
      const fileRecieved = req.file
      const { name, description, event, employee, type }:
        { name: string, description: string, event?: number, employee?: number, type: FileTypeEnum } = req.body

      const ctx = Context.get(req)

      let userId = null

      let user = ctx.user
      if (user.roles === Role.ADMIN) {
        if (req.params.id) {
          userId = parseInt(req.params.id)
          user = await getManager().findOne(UserEntity, userId)
        } else {
          userId = user.id
        }
      } else {
        userId = user.id
      }

      const result = await cloudinary.v2.uploader.upload(fileRecieved.path, {
        folder: `beright-${process.env.NODE_ENV}/imageRight/user-${userId}-${user.firstName}-${user.lastName}`,
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

      const file = getManager().create(FileEntity, fileToPost)
      await getManager().save(file)

      if (file) {
        return res.status(200).json(file)
      } else {
        return res.status(400).json({ message: 'File not uploaded' })
      }
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  /**
   * @param file file: Partial<FileEntity>
   * @returns return file just updated
   */
  public static updateOne = async (req: Request, res: Response) => {
    try {
      const { file }: { file: Partial<FileEntity> } = req.body
      const id = parseInt(req.params.id)
      const fileUpdated = await FileService.updateFile(id, file as FileEntity)
      return res.status(200).json(fileUpdated)
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
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
        return res.status(200).json(files)
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
      const files = await getManager().find(FileEntity, { where: { createdByUser: userId } })
      if (files.length > 0) {
        return res.status(200).json(files)
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
        return res.status(200).json(files)
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
        return res.status(200).json(files)
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
      const files = await getManager().find(FileEntity, { where: { createdByUser: userId, event: eventId } })
      if (files.length > 0) {
        return res.status(200).json(files)
      }
      return res.status(200).json({ message: 'Files not found' })
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
      const file = await getManager().findOne(FileEntity, id)
      if (file) {
        await cloudinary.v2.uploader.destroy(file.public_id)
        const deleted = await FileService.deleteFile(id)
        return deleted ? res.status(204).json({ message: 'File deleted successfully' }) : res.status(400).json({ message: 'File not found' })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }
  // TODO add update file
}