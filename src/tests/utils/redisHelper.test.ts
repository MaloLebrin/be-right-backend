import { expect, test } from 'vitest'
import { EntitiesEnum } from '../../types'
import {
  generateRedisKey,
  generateRedisKeysArray,
  parseRedisKey,
} from '../../utils/redisHelper'

test('parseRedisKey send right bool', () => {
  expect(parseRedisKey(`${EntitiesEnum.ANSWER}-id-1`)).toEqual({
    field: 'id',
    value: '1',
  })
  expect(parseRedisKey(`${EntitiesEnum.ANSWER}-token-lerhjglhlhgtihjegi`)).toEqual({
    field: 'token',
    value: 'lerhjglhlhgtihjegi',
  })
  expect(parseRedisKey(`${EntitiesEnum.ANSWER}-tttt-zefgggggg`)).not.toEqual({
    field: 'id',
    value: '1',
  })
})

test('generateRedisKey send right redis key', () => {
  Object.values(EntitiesEnum).forEach(val => {
    expect(generateRedisKey({
      field: 'id',
      typeofEntity: val,
      id: 1,
    })).toEqual(`${val}-id-1`)
  })

  Object.values(EntitiesEnum).forEach(val => {
    expect(generateRedisKey({
      field: 'token',
      typeofEntity: val,
      id: 1,
    })).toEqual(`${val}-token-1`)
  })
})

test('generateRedisKey send right redis key', () => {
  Object.values(EntitiesEnum).forEach(val => {
    expect(generateRedisKeysArray({
      field: 'id',
      typeofEntity: val,
      ids: [1, 2, 3],
    })).toEqual([
      `${val}-id-1`,
      `${val}-id-2`,
      `${val}-id-3`,
    ])
  })

  Object.values(EntitiesEnum).forEach(val => {
    expect(generateRedisKeysArray({
      field: 'token',
      typeofEntity: val,
      ids: [1, 2, 3],
    })).toEqual([
      `${val}-token-1`,
      `${val}-token-2`,
      `${val}-token-3`,
    ])
  })
})
