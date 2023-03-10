import { Effect, getActiveEffect } from './effect'
import { isObject } from '@euv/shared'

export type Key = string | symbol

const IS_REACTIVE = Symbol()

export interface Target extends Object {
  [IS_REACTIVE]?: boolean
}

export type Effects = Set<Effect>
export type Bucket = Map<Key, Effects>
export type Store = Map<Target, Bucket>
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

  trackEffects(effects)
}

export function trackEffects(effects: Set<Effect>) {
  const activeEffect = getActiveEffect()

  if (activeEffect) {
    effects.add(activeEffect)
  }
}

function trigger(target: Target, key: Key): void {
  const bucket: Bucket | undefined = store.get(target)

  if (!bucket) {
    return
  }

  const effects: Effects | undefined = bucket.get(key)

  if (!effects) {
    return
  }

  triggerEffects(effects)
}

export function triggerEffects(effects: Set<Effect>) {
  const activeEffect = getActiveEffect()

  for (const effect of effects) {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
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

      if (isObject(result)) {
        return reactive(result)
      }

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
