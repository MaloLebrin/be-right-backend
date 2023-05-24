import { Router } from 'express'
import type { DataSource } from 'typeorm'

export abstract class BaseRouter {
  DATA_SOURCE?: DataSource
  router: Router

  constructor(SOURCE: DataSource) {
    if (!this.DATA_SOURCE?.isInitialized) {
      this.DATA_SOURCE = SOURCE
    }
    this.router = Router()
  }
}

export interface BaseInterfaceRouter {
  DATA_SOURCE?: DataSource
  router: Router
  intializeRoutes: () => Router
}
