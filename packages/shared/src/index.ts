export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

export const objectToString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  return objectToString.call(value)
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
