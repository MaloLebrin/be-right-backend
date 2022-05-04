/**
 * Determines whether an object has a property with the specified name
 *
 * @see https://eslint.org/docs/rules/no-prototype-builtins
 * @category Object
 */
export function hasOwnProperty<T>(obj: T, v: PropertyKey): boolean {
  if (obj == null)
    return false
  return Object.prototype.hasOwnProperty.call(obj, v)
}
