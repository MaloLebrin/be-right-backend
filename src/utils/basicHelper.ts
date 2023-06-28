import type { Request } from 'express'

/**
 * Returns the object type of the given value.
 *
 * @param value
 * @returns string
 */
export function getType<T>(value: T): string {
  return Object.prototype.toString.call(value).slice(8, -1)
}

/**
 * Returns true if `value` is a number.
 *
 * @param value any
 * @returns `true` || `false`
 */
export function isNumber(value: any): value is number {
  return getType(value) === 'Number'
}

export function parseBoolean(v: string) {
  switch (v) {
    case 'false':
      return false
    case 'true':
      return true

    default:
      return undefined
  }
}

export function parseQueryIds(ids: string) {
  return ids
    .split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
}

export function getCookies(req: Request) {
  return req.headers?.cookie.split('; ')
}

export function getCookie(req: Request, name: string) {
  const cookies = getCookies(req)
  return cookies.find(str => str.startsWith(name)).split('=')[1]
}
