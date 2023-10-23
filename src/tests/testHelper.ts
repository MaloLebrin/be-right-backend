import type { DataSource } from 'typeorm'
import Database from 'better-sqlite3'
import { createTestAppSource } from '../utils'

export class TestHelper {
  private static _instance: TestHelper
  TEST_APP_SOURCE: DataSource
  isInitialized = false
  private constructor() {}

  public static get instance(): TestHelper {
    if (!this._instance)
      this._instance = new TestHelper()

    return this._instance
  }

  private dbConnect!: DataSource
  private testdb!: any

  async setupTestDB() {
    this.testdb = new Database(':memory:', { verbose: console.log })
    this.TEST_APP_SOURCE = createTestAppSource()
    this.dbConnect = await this.TEST_APP_SOURCE.initialize()
    this.isInitialized = this.TEST_APP_SOURCE.isInitialized

    if (!this.isInitialized) {
      await this.setupTestDB()
    }
  }

  teardownTestDB() {
    this.testdb.close()
  }
}
