import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { SessionEntity } from '../SessionEntity'
import { BasePersonEntity } from './BasePerson'

@Entity()
export abstract class BaseAuthEntity extends BasePersonEntity {
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
