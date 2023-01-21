import { reactive, ReactiveFlags, Target } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { track, trigger } from './effect'
import { hasChanged, isObject } from '@euv/shared'

const get = /*#__PURE__*/ createGetter()

function createGetter() {
  return function get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    const res = Reflect.get(target, key, receiver)
    track(target, TrackOpTypes.GET, key)

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return reactive(res)
    }

    return res
  }
}

const set = /*#__PURE__*/ createSetter()

function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key]
    const result = Reflect.set(target, key, value, receiver)

    if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }

    return result
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
