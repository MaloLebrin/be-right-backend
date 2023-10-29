import { describe, expect, test } from '@jest/globals'
import type { Request } from 'express'
import {
  getCookie,
  getType,
  isNumber,
  parseBoolean,
  parseQueryIds,
} from '../../utils/basicHelper'

describe('GetType', () => {
  test('getType send right type', () => {
    expect(getType({})).toEqual('Object')
    expect(getType('')).toEqual('String')
    expect(getType(2)).toEqual('Number')
    expect(getType(false)).toEqual('Boolean')
    expect(getType(true)).toEqual('Boolean')
    expect(getType([])).toEqual('Array')
    expect(getType(() => { })).toEqual('Function')
  })
})

describe('isNumber', () => {
  test('isNumber send right type', () => {
    expect(isNumber({})).toBeFalsy()
    expect(isNumber('')).toBeFalsy()
    expect(isNumber(2)).toBeTruthy()
    expect(isNumber(false)).toBeFalsy()
    expect(isNumber(true)).toBeFalsy()
    expect(isNumber([])).toBeFalsy()
    expect(isNumber(() => { })).toBeFalsy()
  })
})

describe('ParseBoolan', () => {
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
})

describe('parseQueryIds', () => {
  test('parseQueryIds parse correctly ids queries', () => {
    expect(parseQueryIds('1,2,3,4,5')).toEqual([1, 2, 3, 4, 5])
  })
})

describe('getCookies', () => {
  test('getCookies', () => {
    expect(getCookie({} as unknown as Request, '')).toBeUndefined()
    expect(getCookie({ headers: { cookie: '' } } as unknown as Request, 'test')).toBeUndefined()
    expect(getCookie({ headers: { cookie: 'test=value' } } as unknown as Request, 'test')).toStrictEqual('value')
  })
})
