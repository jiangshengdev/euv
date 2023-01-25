import { isObject, toRawType } from '@euv/shared'
import { mutableHandlers } from './baseHandlers'
import { mutableCollectionHandlers } from './collectionHandlers'
import type { Ref, UnwrapRefSimple } from './ref'

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive'
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

export const reactiveMap = new WeakMap<Target, any>()

const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

function getTargetType(value: Target) {
  const skip = value[ReactiveFlags.SKIP]
  const notExtensible = !Object.isExtensible(value)

  if (skip || notExtensible) {
    return TargetType.INVALID
  } else {
    const rawType = toRawType(value)
    const targetType = targetTypeMap(rawType)

    return targetType
  }
}

// only unwrap nested ref
export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>

/**
 * Creates a reactive copy of the original object.
 *
 * The reactive conversion is "deep"—it affects all nested properties. In the
 * ES2015 Proxy based implementation, the returned proxy is **not** equal to the
 * original object. It is recommended to work exclusively with the reactive
 * proxy and avoid relying on the original object.
 *
 * A reactive object also automatically unwraps refs contained in it, so you
 * don't need to use `.value` when accessing and mutating their value:
 *
 * ```js
 * const count = ref(0)
 * const obj = reactive({
 *   count
 * })
 *
 * obj.count++
 * obj.count // -> 1
 * count.value // -> 1
 * ```
 */
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>

export function reactive(target: object) {
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}

export declare const ShallowReactiveMarker: unique symbol

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }

    return target
  }

  // target is already a Proxy, return it.
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)

  if (existingProxy) {
    return existingProxy
  }

  // only specific value types can be observed.
  const targetType = getTargetType(target)

  if (targetType === TargetType.INVALID) {
    return target
  }

  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )

  proxyMap.set(target, proxy)

  return proxy
}

export function isReactive(value: unknown): boolean {
  const is = !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])

  return is
}
