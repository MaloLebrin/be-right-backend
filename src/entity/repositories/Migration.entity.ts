import { Column, Entity, VersionColumn } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'

@Entity()
export class MigrationEntity extends BaseEntity {
  @Column({ unique: true })
  name: string

  @VersionColumn()
  version: number
}
