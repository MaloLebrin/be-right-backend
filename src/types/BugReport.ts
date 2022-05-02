export enum BugReportType {
  BUG = 'bug',
  FEATURE_REQUEST = 'feature_request',
}

export enum BugReportStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  WILL_NOT_FIX = 'will_not_fix',
}

export const bugReportSearchableFields = [
  'name',
  'type',
  'status',
  'url',
  'createdByUser',
  'createdAt',
]