import { afterEach, expect, jest, test } from '@jest/globals'
import { createDBConnection } from './config/createDBConnection'

const mockDS = {
  initialize: jest.fn(),
}

jest.mock('typeorm', () => {
  return {
    DataSource: jest.fn().mockImplementation(() => mockDS),
  }
})

// Env
const mockEnv = {
  get: jest.fn(),
  DATABASE_URL: jest.fn(() => 'DATABASE_URL'),
}
jest.mock('../../.env', () => {
  return {
    Environment: mockEnv,
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

test('calls .initialize() and env.get', async () => {
  await createDBConnection()
  expect(mockDS.initialize).toHaveBeenCalled()
})
