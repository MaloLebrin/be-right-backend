import type { EntitiesEnum, RedisKeys } from '../types'

export function generateRedisKey({
  field,
  typeofEntity,
  id,
}: {
  field: 'id' | 'token'
  typeofEntity: EntitiesEnum
  id: string | number
}): RedisKeys {
  return `${typeofEntity}-${field}-${id}` as RedisKeys
}

export function generateRedisKeysArray({
  field,
  typeofEntity,
  ids,
}: {
  field: 'id' | 'token'
  typeofEntity: EntitiesEnum
  ids: string[] | number[]
}): RedisKeys[] {
  return ids.map((id: string | number) =>
    `${typeofEntity}-${field}-${id}`) as RedisKeys[]
}

export function parseRedisKey(key: `${string}-${string}-${string}`) {
  return {
    field: key.split('-')[1],
    value: key.split('-')[2],
  }
}
