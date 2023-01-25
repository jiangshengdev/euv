import { Effect, getActiveEffect } from './effect'

type Key = string | symbol

const IS_REACTIVE = Symbol()

interface Target extends Object {
  [IS_REACTIVE]?: boolean
}

type Effects = Set<Effect>
type Bucket = Map<Key, Effects>
type Store = Map<Target, Bucket>

export const store: Store = new Map()

function track(target: Target, key: Key): void {
  const activeEffect = getActiveEffect()

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

function trigger(target: Target, key: Key): void {
  const activeEffect = getActiveEffect()
  const bucket: Bucket | undefined = store.get(target)

  if (!bucket) {
    return
  }

  const effects: Effects | undefined = bucket.get(key)

  if (!effects) {
    return
  }

  for (const effect of effects) {
    if (effect !== activeEffect) {
      effect.run()
    }
  }
}

export function reactive<T extends Target>(target: T): T {
  const proxy = new Proxy<T>(target, {
    get(target: T, key: Key, receiver: object): any {
      if (key === IS_REACTIVE) {
        return true
      }

      const result = Reflect.get(target, key, receiver)

      track(target, key)

      return result
    },
    set(target: T, key: Key, value: unknown, receiver: object): boolean {
      const result = Reflect.set(target, key, value, receiver)

      trigger(target, key)

      return result
    }
  })

  return proxy
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[IS_REACTIVE])
}
