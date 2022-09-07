/* eslint-disable @typescript-eslint/indent */

import { Column, Entity, ManyToOne } from 'typeorm'
import { FileTypeEnum } from '../types/File'
import { BaseEntity } from './BaseEntity'
import { EmployeeEntity } from './EmployeeEntity'
import EventEntity from './EventEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class FileEntity extends BaseEntity {
  @Column()
  name: string

  @Column()
  fileName: string

  @Column()
  mimeType: string

  @Column()
  size: number

  @Column({ type: 'enum', enum: FileTypeEnum, default: FileTypeEnum.IMAGE_RIGHT })
  type: FileTypeEnum

  @Column({ nullable: true })
  description: string

  @Column()
  public_id: string

  @Column()
  signature: string

  @Column()
  width: number

  @Column()
  height: number

  @Column()
  format: string

  @Column()
  url: string

  @Column()
  secure_url: string

  @Column()
  original_filename: string

  @ManyToOne(() => EventEntity, event => event.files)
  event: number

  @ManyToOne(() => EmployeeEntity, employee => employee.files)
  employee: number

  @ManyToOne(() => UserEntity, user => user.files)
  createdByUser: number
}

export const filesSearchableFields = [
  'fileName',
  'type',
]
