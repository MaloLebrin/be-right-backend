import type { BugReportStatus } from '../types/BugReport'
import { BugReportEntity } from '../entity/BugReportEntity'
import { APP_SOURCE } from '..'

export default class BugReportService {
  static repository = APP_SOURCE.getRepository(BugReportEntity)

  public static async createOne(BugReport: BugReportEntity): Promise<BugReportEntity> {
    const bugReport = this.repository.create(BugReport)
    await this.repository.save(bugReport)
    return bugReport
  }

  public static async getOne(id: number): Promise<BugReportEntity> {
    const bugReport = await this.repository.findOne({
      where: {
        id,
      },
      relations: ['file', 'createdByUser'],
    })
    return bugReport
  }

  public static async updateOne(id: number, bugReport: BugReportEntity): Promise<BugReportEntity> {
    const bugReportFinded = await this.getOne(id)
    if (!bugReport || bugReportFinded) {
      return null
    }
    await this.repository.update(id, { ...bugReport, updatedAt: new Date() })
    return this.getOne(id)
  }

  public static async updateStatus(id: number, status: BugReportStatus): Promise<BugReportEntity> {
    const bugReportFinded = await this.getOne(id)
    if (!bugReportFinded) {
      return null
    }
    await this.repository.update(id, { status, updatedAt: new Date() })
    return this.getOne(id)
  }

  public static async deleteOne(id: number) {
    return this.repository.delete(id)
  }

  public static async deleteMany(ids: number[]) {
    return this.repository.delete(ids)
  }
}
