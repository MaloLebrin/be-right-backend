/* eslint-disable @typescript-eslint/indent */

import { Column, Entity } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity()
export class ImageRightConditionEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  slug: string

  @Column({ nullable: true })
  description: string
}
