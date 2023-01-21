import { createDep, Dep } from './dep'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { extend, isArray } from '@euv/shared'

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export type EffectScheduler = (...args: any[]) => any

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = []
  parent: ReactiveEffect | undefined = undefined

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}

  run() {
    if (!this.active) {
      let result = this.fn()

      return result
    }

    try {
      this.parent = activeEffect
      activeEffect = this

      cleanupEffect(this)
      let result = this.fn()

      return result
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect

  if (!deps.length) {
    return
  }

  for (const dep of deps) {
    dep.delete(effect)
  }

  deps.length = 0
}

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

export interface ReactiveEffectRunner<T = any> {
  effect: ReactiveEffect

  (): T
}

export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {
  const _effect = new ReactiveEffect(fn)
  if (options) {
    extend(_effect, options)
  }
  _effect.run()

  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

export function stop(runner: ReactiveEffectRunner) {
  runner.effect.stop()
}

export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = createDep()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects(dep: Dep) {
  let shouldTrack = !dep.has(activeEffect!)
  if (!shouldTrack) {
    return
  }

  dep.add(activeEffect!)
  activeEffect!.deps.push(dep)
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

  let deps: (Dep | undefined)[] = []
  deps.push(depsMap.get(key))

  const effects: ReactiveEffect[] = []
  for (const dep of deps) {
    if (dep) {
      effects.push(...dep)
    }
  }

  triggerEffects(createDep(effects))
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  // spread into array for stabilization
  const effects = isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

function triggerEffect(effect: ReactiveEffect) {
  if (effect !== activeEffect) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
