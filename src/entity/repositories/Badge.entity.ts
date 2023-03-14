import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../bases/BaseEntity'

@Entity()
export class BadgeEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column()
  label: string
}
