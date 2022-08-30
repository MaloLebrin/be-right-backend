import type { BugReportEntity, EmployeeEntity, FileEntity, UserEntity } from '../entity'
import type EventEntity from '../entity/EventEntity'

export type EntityRelationWithId =
  EventEntity | UserEntity | FileEntity | EmployeeEntity | BugReportEntity
