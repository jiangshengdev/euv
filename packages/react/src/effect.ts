import { v4 as uuidv4 } from 'uuid'
import { extend, labelKey, parentKey, uuidKey } from '@euv/shared'
import { Computed } from './computed'

export interface Scheduler {
  [uuidKey]?: string
  [parentKey]?: Computed<any>

  (...args: any[]): any
}

export const effectStack: Effect[] = []

export function getActiveEffect(): Effect | undefined {
  return effectStack.at(-1)
}

export const pack: Set<Effect> = new Set()

export class Effect<T = any> {
  public [uuidKey]: string
  public [labelKey]: string
  public [parentKey]?: Effect

  constructor(public fn: () => T, public scheduler: Scheduler | null = null) {
    this[uuidKey] = uuidv4()
    this[labelKey] = fn.name || scheduler ? 'getter' : 'effect'
    pack.add(this)
  }

  run() {
    this[parentKey] = getActiveEffect()
    effectStack.push(this)

    const result = this.fn()

    effectStack.pop()

    return result
  }
}

interface Options {
  scheduler?: Scheduler
}

interface Runner<T = any> {
  effect: Effect

  (): T
}

export function effect<T = any>(fn: () => T, options?: Options): Runner<T> {
  const _effect = new Effect(fn)

  if (options) {
    extend(_effect, options)
  }

  _effect.run()

  const runner = _effect.run.bind(_effect) as Runner<T>

  runner.effect = _effect

  return runner
}
