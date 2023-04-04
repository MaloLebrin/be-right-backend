import { expect, test } from 'vitest'
import {
  getType,
  isNumber,
  parseBoolean,
  parseQueryIds,
} from '../../utils/basicHelper'

test('getType send right type', () => {
  expect(getType({})).toEqual('Object')
  expect(getType('')).toEqual('String')
  expect(getType(2)).toEqual('Number')
  expect(getType(false)).toEqual('Boolean')
  expect(getType(true)).toEqual('Boolean')
  expect(getType([])).toEqual('Array')
  expect(getType(() => { })).toEqual('Function')
})

test('isNumber send right type', () => {
  expect(isNumber({})).toBeFalsy()
  expect(isNumber('')).toBeFalsy()
  expect(isNumber(2)).toBeTruthy()
  expect(isNumber(false)).toBeFalsy()
  expect(isNumber(true)).toBeFalsy()
  expect(isNumber([])).toBeFalsy()
  expect(isNumber(() => { })).toBeFalsy()
})

test('ParseBoolan send right bool value', () => {
  expect(parseBoolean('true')).toBeTruthy()
  expect(parseBoolean('true')).toEqual(true)
  expect(parseBoolean('false')).toBeFalsy()
  expect(parseBoolean('false')).toEqual(false)
  expect(parseBoolean('ffff')).toEqual(undefined)
  expect(parseBoolean('ffff')).toBeFalsy()
  expect(parseBoolean('')).toEqual(undefined)
  expect(parseBoolean('')).toBeFalsy()
})

test('parseQueryIds parse correctly ids queries', () => {
  expect(parseQueryIds('1,2,3,4,5')).toEqual([1, 2, 3, 4, 5])
})
