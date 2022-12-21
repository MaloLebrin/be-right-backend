import type { Request, Response } from 'express'
import type { FindOptionsWhere } from 'typeorm'
import { BugReportEntity } from '../entity/BugReportEntity'
import BugReportService from '../services/BugReportService'
import Context from '../context'
import { paginator, wrapperRequest } from '../utils'
import { bugReportSearchableFields } from '../types/BugReport'
import { APP_SOURCE } from '..'

export default class BugReportController {
  static getManager = APP_SOURCE.manager
  static bugRepository = APP_SOURCE.getRepository(BugReportEntity)

  public static createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      const ctx = Context.get(req)

      const userId = ctx.user.id
      const bugReportToCreate = {
        ...bugReport,
        createdByUser: userId,
      }

      const newBugReport = await BugReportService.createOne(bugReportToCreate)
      return res.status(200).json(newBugReport)
    })
  }

  public static updateStatus = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { status } = req.body
      if (status && id) {
        const updatedBugReport = await BugReportService.updateStatus(id, status)
        return res.status(200).json(updatedBugReport)
      }
      return res.status(400).json({ error: 'status is required' })
    })
  }

  public static updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      if (bugReport && id) {
        const updatedBugReport = await BugReportService.updateOne(id, bugReport)
        return res.status(200).json(updatedBugReport)
      }
      return res.status(400).json({ error: 'bugReport is required' })
    })
  }

  /**
 * @param Id number
 * @returns entity form given id
*/
  public static getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const bugReport = await BugReportService.getOne(id)
        return bugReport ? res.status(200).json(bugReport) : res.status(400).json('user not found')
      }
      return res.status(422).json({ error: 'id is required' })
    })
  }

  public static getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, bugReportSearchableFields)
      const bugReports = await this.bugRepository.find({
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<BugReportEntity>,
        },
      })
      return res.status(200).json({ data: bugReports, currentPage: queriesFilters.page, limit: queriesFilters.take })
    })
  }

  public static deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const deletedBugReport = await BugReportService.deleteOne(id)
        return res.status(200).json(deletedBugReport)
      }
      return res.status(422).json({ error: 'id is required' })
    })
  }
}
