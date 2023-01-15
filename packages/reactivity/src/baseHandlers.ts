import { ReactiveFlags, Target } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { track, trigger } from './effect'

export const mutableHandlers: ProxyHandler<object> = {
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    const res = Reflect.get(target, key, receiver)
    track(target, TrackOpTypes.GET, key)

    return res
  },
  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key]

    const result = Reflect.set(target, key, value, receiver)
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)

    return result
  }
}
