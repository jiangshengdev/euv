export * from './looseEqual'

export const NOOP = () => {}

export const attachKey = Symbol('attach')
export const labelKey = Symbol('label')
export const parentKey = Symbol('parent')
export const uuidKey = Symbol('uuid')

export const extend = Object.assign

export const isArray = Array.isArray

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]'

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export function getFnContent(fn: Function) {
  const content = fn.toString().replace(/.*?\{(.*)}.*?/ms, '$1')

  return content.trim()
}
