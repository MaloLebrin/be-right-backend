import { describe, expect, test } from '@jest/globals'
import {
  isArray,
  isArrayOfNumbers,
  uniq,
  uniqByKey,
} from '../../utils/arrayHelper'

const arrayData = [
  { id: 1 },
  { id: 1 },
  { id: 2 },
]

test('isArray send right bool', () => {
  expect(isArray({})).toBeFalsy()
  expect(isArray('')).toBeFalsy()
  expect(isArray(2)).toBeFalsy()
  expect(isArray(false)).toBeFalsy()
  expect(isArray(true)).toBeFalsy()
  expect(isArray([])).toBeTruthy()
})

test('isArrayOfNumbers send right bool', () => {
  expect(isArrayOfNumbers({})).toBeFalsy()
  expect(isArrayOfNumbers('')).toBeFalsy()
  expect(isArrayOfNumbers(2)).toBeFalsy()
  expect(isArrayOfNumbers(false)).toBeFalsy()
  expect(isArrayOfNumbers(true)).toBeFalsy()
  expect(isArrayOfNumbers(['1'])).toBeFalsy()
  expect(isArrayOfNumbers([{}])).toBeFalsy()
  expect(isArrayOfNumbers([true])).toBeFalsy()
  expect(isArrayOfNumbers([1])).toBeTruthy()
})

test('uniq filters duplicate elements well', () => {
  expect(uniq(['1', '1', '2'])).toEqual(['1', '2'])
  expect(uniq([1, 1, 2, 4, 5, 8])).toEqual([1, 2, 4, 5, 8])
})

describe('uniqByKey', () => {
  test('uniqByKey filters duplicate elements well', () => {
    expect(uniqByKey([], 'id')).toStrictEqual([])
    expect(uniqByKey(arrayData, 'id')).toEqual([
      { id: 1 },
      { id: 2 },
    ])
  })

  test('uniqByKey should filter item have not key', () => {
    expect(uniqByKey(arrayData, 'test' as any)).toStrictEqual([])
  })
})
