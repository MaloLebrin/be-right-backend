import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { BugReportStatus, BugReportType } from '../types/BugReport'
import { BaseEntity } from './bases/BaseEntity'
import { FileEntity } from './FileEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class BugReportEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true, type: 'enum', enum: BugReportType })
  type: BugReportType

  @Column({ type: 'enum', enum: BugReportStatus, default: BugReportStatus.OPEN })
  status: BugReportStatus

  @Column({ nullable: true })
  url: string

  @Column()
  description: string

  @ManyToOne(() => FileEntity, { nullable: true, cascade: true })
  @JoinColumn()
  file: FileEntity

  @RelationId((bug: BugReportEntity) => bug.file)
  fileId: number

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  createdByUser: number

  @RelationId((bug: BugReportEntity) => bug.createdByUser)
  createdByUserId: number
}
