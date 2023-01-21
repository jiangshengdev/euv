export const extend = Object.assign

export const isArray = Array.isArray

export function isObject(val: unknown): val is Record<any, any> {
  let notNull = val !== null
  let typeIsObject = typeof val === 'object'
  let is = notNull && typeIsObject

  return is
}

export const objectToString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  let type = objectToString.call(value)

  return type
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  let rawType = toTypeString(value).slice(8, -1)

  return rawType
}

// compare whether a value has changed, accounting for NaN.
export function hasChanged(value: any, oldValue: any): boolean {
  let same = Object.is(value, oldValue)

  return !same
}
