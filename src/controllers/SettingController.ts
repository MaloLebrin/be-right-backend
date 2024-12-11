import type { DataSource, Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { SettingService } from '../services'
import { ApiError } from '../middlewares/ApiError'
import { wrapperRequest } from '../utils'
import { composeSettingPayload } from '../utils/settingsHelper'
import { SettingEntity } from '../entity/SettingEntity'

export class SettingController {
  private SettingService: SettingService
  private repository: Repository<SettingEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.SettingService = new SettingService(DATA_SOURCE)
      this.repository = DATA_SOURCE.getRepository(SettingEntity)
    }
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const setting = await this.SettingService.getOneByUserId(ctx.user.id)
      return res.status(200).json(setting)
    })
  }

  public patchOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const setting: Partial<SettingEntity> = req.body

      if (!ctx || !ctx.user) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }
      const userId = ctx.user.id

      const existingSetting = await this.SettingService.getOneByUserId(userId)

      if (!existingSetting) {
        throw new ApiError(404, 'Paramètres introuvables')
      }

      await this.repository.update(
        existingSetting.id,
        composeSettingPayload({
          ...existingSetting,
          ...setting,
        }),
      )

      const updatedSetting = await this.SettingService.getOneByUserId(userId)
      return res.status(200).json(updatedSetting)
    })
  }
}
