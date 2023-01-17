export type RedisKeys =
  `user-id-${number}` |
  `user-token-${string}` |
  `event-id-${number}` |
  `employee-id-${number}` |
  `answer-id-${number}`

export type MultiSavePaylod<T> = Record<RedisKeys, T>[]

export interface GetManyPayload {
  keys: RedisKeys[]
  objKey?: string
  entity: EntitiesEnum
}

export enum EntitiesEnum {
  USER = 'user',
  EVENT = 'event',
  EMPLOYEE = 'employee',
  ANSWER = 'answer',
}

export type RedisEntitiesField = 'id' | 'token'
