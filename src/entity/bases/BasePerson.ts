import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity()
@Index(['firstName', 'lastName', 'email'], { unique: true })
export abstract class BasePersonEntity extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ length: 100, nullable: true })
  firstName: string

  @Column({ length: 100, nullable: true })
  lastName: string
}
