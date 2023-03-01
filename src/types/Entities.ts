import type { UserEntity } from '../entity/UserEntity'
import type EventEntity from '../entity/EventEntity'
import type { BugReportEntity } from '../entity/BugReportEntity'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import type { FileEntity } from '../entity/FileEntity'

export type EntityRelationWithId =
  EventEntity | UserEntity | FileEntity | EmployeeEntity | BugReportEntity
