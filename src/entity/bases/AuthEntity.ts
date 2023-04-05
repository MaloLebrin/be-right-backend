import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { SessionEntity } from '../SessionEntity'
import { BasePersonEntity } from './BasePerson'

@Entity()
export abstract class BaseAuthEntity extends BasePersonEntity {
  @Column({ nullable: true, select: false })
  password: string | null

  @Column({ unique: true, update: false, select: false })
  salt: string

  @Column({ unique: true, update: false })
  token: string

  @Column({ unique: true, nullable: true, select: false })
  twoFactorRecoveryCode: string | null

  @Column({ unique: true, nullable: true, select: false })
  twoFactorSecret: string | null

  @Column({ nullable: true, unique: true, select: false })
  apiKey: string | null

  @Column({ nullable: true, default: null, select: false })
  loggedAt: Date | null

  @Column({ nullable: true, default: null, select: false })
  passwordUpdatedAt: Date | null

  @Column({ nullable: true, default: null, select: false })
  saltUpdatedAt: Date | null

  @OneToOne(() => SessionEntity, { cascade: true })
  @JoinColumn()
  session: SessionEntity

  @RelationId((user: BaseAuthEntity) => user.session)
  sessionId: number
}
