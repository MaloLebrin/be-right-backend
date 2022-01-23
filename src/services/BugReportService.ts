import { getManager } from "typeorm"
import { BugReportStatus } from "../types/BugReport"
import { BugReportEntity } from "../entity/BugReportEntity"

export default class BugReportService {

  public static async createOne(BugReport: BugReportEntity): Promise<BugReportEntity> {
    const bugReport = getManager().create(BugReportEntity, BugReport)
    await getManager().save(bugReport)
    return bugReport
  }

  public static async getOne(id: number): Promise<BugReportEntity> {
    const bugReport = await getManager().findOne(BugReportEntity, id, { relations: ["file", "createdByUser"] })
    return bugReport
  }

  public static async updateOne(id: number, bugReport: BugReportEntity): Promise<BugReportEntity> {
    const bugReportFinded = await getManager().findOne(BugReportEntity, id)
    if (!bugReport || bugReportFinded) {
      return null
    }
    await getManager().update(BugReportEntity, id, { ...bugReport, updatedAt: new Date() })
    return this.getOne(id)
  }

  public static async updateStatus(id: number, status: BugReportStatus): Promise<BugReportEntity> {
    const bugReportFinded = await getManager().findOne(BugReportEntity, id)
    if (!bugReportFinded) {
      return null
    }
    await getManager().update(BugReportEntity, id, { status: status, updatedAt: new Date() })
    return this.getOne(id)
  }

  public static async deleteOne(id: number) {
    return getManager().delete(BugReportEntity, id)
  }

  public static async deleteMany(ids: number[]) {
    return getManager().delete(BugReportEntity, ids)
  }
}
