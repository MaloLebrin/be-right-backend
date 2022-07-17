import type { EntityRelationWithId } from '../types/Entities'
import { isArrayOfNumbers } from './arrayHelper'

export function formatEntityRelationWithId(entities: EntityRelationWithId[]): number[] {
  if (entities && entities.length > 0) {
    if (!isArrayOfNumbers(entities)) {
      return entities.map(entity => entity.id).filter(id => id)
    }
    return entities as unknown as number[]
  }
  return []
}

export function addUserToEntityRelation<T>(entities: T[], userId: number): T[] {
  if (entities && entities.length > 0 && userId) {
    return entities.map(entity => ({
      ...entity,
      createdByUser: userId,
    }))
  }
  return []
}
