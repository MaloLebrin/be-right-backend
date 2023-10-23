import { beforeAll, describe, expect } from 'vitest'
import { TestHelper } from './testHelper'

beforeAll(async () => {
  await TestHelper.instance.setupTestDB()
})

describe('Test Db Connection', async () => {
  const isInialized = TestHelper.instance.isInitialized
  expect(isInialized).toBeTruthy()
})
