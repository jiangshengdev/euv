export * from './looseEqual'

export const NOOP = () => {}

export const extend = Object.assign

export const isArray = Array.isArray

export function isDate(val: unknown): val is Date {
  return toTypeString(val) === '[object Date]'
}

export function isFunction(val: unknown): val is Function {
  const is = typeof val === 'function'

  return is
}

export function isSymbol(val: unknown): val is symbol {
  return typeof val === 'symbol'
}

export function isObject(val: unknown): val is Record<any, any> {
  const notNull = val !== null
  const typeIsObject = typeof val === 'object'
  const is = notNull && typeIsObject

  return is
}

export const objectToString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  const type = objectToString.call(value)

  return type
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  const rawType = toTypeString(value).slice(8, -1)

  return rawType
}

// compare whether a value has changed, accounting for NaN.
export function hasChanged(value: any, oldValue: any): boolean {
  const same = Object.is(value, oldValue)

  return !same
}
