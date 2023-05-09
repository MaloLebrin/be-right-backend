import type { Request, Response } from 'express'
import type { EntityManager, Repository } from 'typeorm'
import { BugReportEntity } from '../entity/BugReportEntity'
import BugReportService from '../services/BugReportService'
import Context from '../context'
import { paginator, wrapperRequest } from '../utils'
import { bugReportSearchableFields } from '../types/BugReport'
import { APP_SOURCE } from '..'
import { ApiError } from '../middlewares/ApiError'

export default class BugReportController {
  getManager: EntityManager
  BugReportService: BugReportService
  bugRepository: Repository<BugReportEntity>

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.BugReportService = new BugReportService()
    this.bugRepository = APP_SOURCE.getRepository(BugReportEntity)
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      const ctx = Context.get(req)

      const userId = ctx.user.id
      const bugReportToCreate = {
        ...bugReport,
        createdByUser: userId,
      }

      const newBugReport = await this.BugReportService.createOne(bugReportToCreate)
      return res.status(200).json(newBugReport)
    })
  }

  public updateStatus = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { status } = req.body
      if (status && id) {
        const updatedBugReport = await this.BugReportService.updateStatus(id, status)
        return res.status(200).json(updatedBugReport)
      }
      throw new ApiError(422, 'Le status est requis')
    })
  }

  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      if (bugReport && id) {
        const updatedBugReport = await this.BugReportService.updateOne(id, bugReport)
        return res.status(200).json(updatedBugReport)
      }
      throw new ApiError(422, 'Le bug est requis')
    })
  }

  /**
 * @param Id number
 * @returns entity form given id
*/
  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const bugReport = await this.BugReportService.getOne(id)
        return bugReport ? res.status(200).json(bugReport) : res.status(400).json('user not found')
      }
      throw new ApiError(422, 'L\'identifiant est requis')
    })
  }

  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { where, page, take, skip } = paginator(req, bugReportSearchableFields)

      const [data, total] = await this.bugRepository.findAndCount({
        take,
        skip,
        where,
      })

      return res.status(200).json({
        data,
        currentPage: page,
        limit: take,
        total,
      })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const deletedBugReport = await this.BugReportService.deleteOne(id)
        return res.status(200).json(deletedBugReport)
      }
      throw new ApiError(422, 'L\'identifiant est requis')
    })
  }
}
