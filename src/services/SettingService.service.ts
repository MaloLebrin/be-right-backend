import type { DataSource, Repository } from 'typeorm'
import { SettingEntity } from '../entity/SettingEntity'
import { ThemeEnum } from '../types'

export class SettingService {
  private repository: Repository<SettingEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(SettingEntity)
  }

  async getOneByUserId(userId: number) {
    return this.repository.findOne({
      where: { userId },
    })
  }

  async createOne({
    userId,
    payload,
  }: {
    userId: number
    payload: Partial<Omit<SettingEntity, 'userId' | 'user'>>
  }) {
    const newOne = await this.repository.save({
      user: {
        id: userId,
      },
      ...payload,
    })
    return this.repository.save(newOne)
  }

  async createDefaultOneForUser(userId: number) {
    const newOne = this.repository.create({
      theme: ThemeEnum.LIGHT,
      paginatedRequestLimit: {
        events: 20,
        notifications: 20,
        recipients: 20,
      },
      user: {
        id: userId,
      },
    })
    return this.repository.save(newOne)
  }

  async deleteOneByUserId(userId: number) {
    return this.repository.softDelete({ userId })
  }

  async deleteForEverOneByUserId(userId: number) {
    return this.repository.delete({ userId })
  }

  async restoreOneByUserId(userId: number) {
    const exist = await this.repository.findOneOrFail({
      withDeleted: true,
      where: { userId },
    })
    return this.repository.restore({ id: exist.id })
  }
}
