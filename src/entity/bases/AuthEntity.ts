import { Column, Entity, Index, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { SessionEntity } from '../SessionEntity'
import { BaseEntity } from './BaseEntity'

@Entity()
@Index(['firstName', 'lastName', 'email'], { unique: true })
export abstract class BaseAuthEntity extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ length: 100, nullable: true })
  firstName: string

  @Column({ length: 100, nullable: true })
  lastName: string

  @Column({ nullable: true })
  password: string

  @Column({ unique: true, update: false })
  salt: string

  @Column({ unique: true, update: false })
  token: string

  @Column({ unique: true, nullable: true })
  twoFactorRecoveryCode: string | null

  @Column({ unique: true, nullable: true })
  twoFactorSecret: string | null

  @Column({ nullable: true, unique: true })
  apiKey: string

  @Column({ nullable: true, default: null })
  loggedAt: Date

  @Column({ nullable: true, default: null })
  passwordUpdatedAt: Date

  @Column({ nullable: true, default: null })
  saltUpdatedAt: Date

  @OneToOne(() => SessionEntity, { cascade: true })
  @JoinColumn()
  session: SessionEntity

  @RelationId((user: BaseAuthEntity) => user.session)
  sessionId: number
}
