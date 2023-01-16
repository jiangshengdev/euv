import { createDep, Dep } from './dep'
import { TrackOpTypes, TriggerOpTypes } from './operations'

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = []
  parent: ReactiveEffect | undefined = undefined

  constructor(public fn: () => T) {}

  run() {
    if (!this.active) {
      return this.fn()
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
}

export interface ReactiveEffectRunner<T = any> {
  effect: ReactiveEffect

  (): T
}

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()

  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep()))
    }

    let shouldTrack = !dep.has(activeEffect!)
    if (shouldTrack) {
      dep.add(activeEffect!)
      activeEffect!.deps.push(dep)
    }
  }
}

export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  const dep = depsMap.get(key)
  if (!dep) {
    return
  }

  for (const effect of dep) {
    if (effect !== activeEffect) {
      effect.run()
    }
  }
}
