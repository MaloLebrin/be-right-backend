import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { ThemeEnum } from '../types'
import { BaseEntity } from './bases/BaseEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class SettingEntity extends BaseEntity {
  @Column({ nullable: true, type: 'json', default: null })
  paginatedRequestLimit: {
    events: number | null
    recipients: number | null
    notifications: number | null
  }

  @Column({ type: 'enum', enum: ThemeEnum, default: ThemeEnum.LIGHT })
  theme: ThemeEnum

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @RelationId((user: UserEntity) => user.id)
  readonly userId: number
}
