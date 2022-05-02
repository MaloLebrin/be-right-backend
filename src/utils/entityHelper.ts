import { EntityRelationWithId } from "../types/Entities"

export function formatEntityRelationWithId(entities: EntityRelationWithId[]) {
  if (entities && entities?.length > 0) {
    return entities.map(entity => entity.id).filter(id => id)
  }
  return []
}
