import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'

@Entity()
@Index('UNIQ_MIGRATION_NAME_VERSION', ['name', 'version'], { unique: true })
export class MigrationEntity extends BaseEntity {
  @Column()
  name: string

  @Column()
  version: number
}
