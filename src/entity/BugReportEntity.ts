import { BugReportStatus, BugReportType } from "../types/BugReport"
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { FileEntity, UserEntity } from "."
import { BaseEntity } from "./BaseEntity"


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

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  createdByUser: number
}
