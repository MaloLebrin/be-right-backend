import { Column, Entity, ManyToMany, RelationId } from 'typeorm'
import type { BadgeEnumIcon } from '../../types/Badge'
import { BadgeEnumLabel, BadgeEnumName } from '../../types/Badge'
import { BaseEntity } from '../bases/BaseEntity'
import { UserEntity } from '../UserEntity'

@Entity()
export class BadgeEntity extends BaseEntity {
  @Column({ type: 'enum', enum: BadgeEnumName })
  name: BadgeEnumName

  @Column({ unique: true })
  slug: string

  @Column({ type: 'enum', enum: BadgeEnumLabel })
  label: BadgeEnumLabel

  @Column()
  icon: BadgeEnumIcon

  @ManyToMany(() => UserEntity, user => user.badges)
  // @JoinTable()
  users: UserEntity[]

  @RelationId((group: BadgeEntity) => group.users)
  userIds: number[]
}
