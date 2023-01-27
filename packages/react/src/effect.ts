import { v4 as uuidv4 } from 'uuid'
import { extend } from '@euv/shared'

type Scheduler = (...args: any[]) => any

const effectStack: Effect[] = []

export function getActiveEffect(): Effect | undefined {
  return effectStack.at(-1)
}

export const pack: Set<Effect> = new Set()

export class Effect<T = any> {
  id: string
  name: string
  parentId?: string

  constructor(public fn: () => T, public scheduler: Scheduler | null = null) {
    this.id = uuidv4()
    this.name = fn.name
    pack.add(this)
  }

  run() {
    this.parentId = getActiveEffect()?.id
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
