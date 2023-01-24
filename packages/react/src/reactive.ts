import { Effect, getActiveEffect } from './effect'

type Key = string | symbol

interface Target {}

type Effects = Set<Effect>
type Bucket = Map<Key, Effects>
type Store = WeakMap<Target, Bucket>

let store: Store = new WeakMap()

function track(target: Target, key: Key) {
  let activeEffect = getActiveEffect()
  if (!activeEffect) {
    return
  }

  let bucket: Bucket | undefined = store.get(target)
  if (!bucket) {
    bucket = new Map()
    store.set(target, bucket)
  }

  let effects: Effects | undefined = bucket.get(key)
  if (!effects) {
    effects = new Set()
    bucket.set(key, effects)
  }

  effects.add(activeEffect)
}

function trigger(target: Target, key: Key) {
  let bucket: Bucket | undefined = store.get(target)
  if (!bucket) {
    return
  }

  let effects: Effects | undefined = bucket.get(key)
  if (!effects) {
    return
  }

  for (const effect of effects) {
    effect.run()
  }
}

export function reactive<T extends Target>(target: T): T {
  let proxy = new Proxy<T>(target, {
    get(target: T, key: Key, receiver: any): any {
      let result = Reflect.get(target, key, receiver)

      track(target, key)

      return result
    },
    set(target: T, key: Key, value: any, receiver: any): boolean {
      let result = Reflect.set(target, key, value, receiver)

      trigger(target, key)

      return result
    }
  })

  return proxy
}
