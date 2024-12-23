import type { DataSource, Repository } from 'typeorm'
import { UserEntity } from '../../entity/UserEntity'

export class BaseUserService {
  public repository: Repository<UserEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(UserEntity)
  }
}
