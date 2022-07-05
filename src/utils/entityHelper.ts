import { EntityRelationWithId } from "../types/Entities"
import { isArrayOfNumbers } from "./arrayHelper"

export function formatEntityRelationWithId(entities: EntityRelationWithId[]): number[] {
  if (entities && entities.length > 0) {
    if (!isArrayOfNumbers(entities)) {
      return entities.map(entity => entity.id).filter(id => id)
    } else {
      return entities as unknown as number[]
    }
  }
  return []
}
