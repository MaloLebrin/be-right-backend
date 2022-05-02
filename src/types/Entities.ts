import { EmployeeEntity, FileEntity, UserEntity } from "../entity"
import { BugReportEntity } from "../entity/BugReportEntity"
import EventEntity from "../entity/EventEntity"

export type EntityRelationWithId =
  EventEntity | UserEntity | FileEntity | EmployeeEntity | BugReportEntity
