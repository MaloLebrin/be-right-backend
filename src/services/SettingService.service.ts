import type { DataSource, Repository } from 'typeorm'
import { SettingEntity } from '../entity/SettingEntity'

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
    return this.repository.save({
      user: {
        id: userId,
      },
      ...payload,
    })
  }

  async deleteOneByUserId(userId: number) {
    return this.repository.softDelete({ userId })
  }

  async restoreOneByUserId(userId: number) {
    const exist = await this.repository.findOneOrFail({
      withDeleted: true,
      where: { userId },
    })
    return this.repository.restore({ id: exist.id })
  }
}
