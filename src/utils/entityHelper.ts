import { EntityRelationWithId } from "../types/Entities"
import { isArrayOfNumbers } from "./arrayHelper"

export function formatEntityRelationWithId(entities: EntityRelationWithId[]) {
  if (entities && entities.length > 0 && !isArrayOfNumbers(entities)) {
    return entities.map(entity => entity.id).filter(id => id)
  }
  return []
}
