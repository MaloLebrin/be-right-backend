import { Column, Entity } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'

@Entity()
export class SessionEntity extends BaseEntity {
  @Column({ nullable: true, default: null })
  loggedAt: Date

  @Column({ nullable: true, default: null })
  passwordUpdatedAt: Date

  @Column({ nullable: true, default: null })
  saltUpdatedAt: Date
}
