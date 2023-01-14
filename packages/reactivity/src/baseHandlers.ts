import { ReactiveFlags, Target } from './reactive'

export const mutableHandlers: ProxyHandler<object> = {
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    const res = Reflect.get(target, key, receiver)
    return res
  },
  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const result = Reflect.set(target, key, value, receiver)
    return result
  }
}
