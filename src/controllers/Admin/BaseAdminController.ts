import type { DataSource } from 'typeorm'

export abstract class BaseAdminController {
  private DATA_SOURCE?: DataSource

  constructor(SOURCE: DataSource) {
    if (!this.DATA_SOURCE?.isInitialized) {
      this.DATA_SOURCE = SOURCE
    }
  }
}
