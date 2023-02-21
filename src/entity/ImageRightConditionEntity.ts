import { Column, Entity } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'

@Entity()
export class ImageRightConditionEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  slug: string

  @Column({ nullable: true })
  description: string
}
