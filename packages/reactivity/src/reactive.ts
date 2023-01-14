import { isObject } from '@uv/shared'
import { mutableHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const reactiveMap = new WeakMap<Target, any>()

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

export function reactive(target: object) {
  if (!isObject(target)) {
    return target
  }

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // target already has corresponding Proxy
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}
