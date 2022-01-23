import { BugReportEntity } from "../entity/BugReportEntity"
import BugReportService from "../services/BugReportService"
import { Request, Response } from "express"
import Context from "../context"
import { paginator } from "../utils"
import { bugReportSearchableFields } from "../types/BugReport"
import { getManager } from "typeorm"

export default class BugReportController {


  public static createOne = async (req: Request, res: Response) => {
    try {
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      const ctx = Context.get(req)

      const userId = ctx.user.id
      const bugReportToCreate = {
        ...bugReport,
        createdByUser: userId,
      }

      const newBugReport = await BugReportService.createOne(bugReportToCreate)
      return res.status(200).json(newBugReport)
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static updateStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const { status } = req.body
      if (status) {
        const updatedBugReport = await BugReportService.updateStatus(id, status)
        return res.status(200).json(updatedBugReport)
      } else {
        return res.status(400).json({ error: "status is required" })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static updateOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const { bugReport }: { bugReport: BugReportEntity } = req.body
      if (bugReport) {
        const updatedBugReport = await BugReportService.updateOne(id, bugReport)
        return res.status(200).json(updatedBugReport)
      } else {
        return res.status(400).json({ error: "bugReport is required" })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  /**
 * @param Id number
 * @returns entity form given id
*/
  public static getOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const bugReport = await BugReportService.getOne(id)
      return bugReport ? res.status(200).json(bugReport) : res.status(400).json('user not found')
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static getAll = async (req: Request, res: Response) => {
    try {
      const queriesFilters = paginator(req, bugReportSearchableFields)
      const [bugReports, count] = await getManager().findAndCount(BugReportEntity, queriesFilters)
      return res.status(200).json({ data: bugReports, currentPage: queriesFilters.page, limit: queriesFilters.take, total: count })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const deletedBugReport = await BugReportService.deleteOne(id)
      return res.status(200).json(deletedBugReport)
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }
}