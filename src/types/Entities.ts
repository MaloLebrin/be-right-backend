import type { BugReportEntity, EmployeeEntity, FileEntity, UserEntity } from "../entity"
import EventEntity from "../entity/EventEntity"

export type EntityRelationWithId =
  EventEntity | UserEntity | FileEntity | EmployeeEntity | BugReportEntity
