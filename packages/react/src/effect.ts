import { v4 as uuidv4 } from 'uuid'

const activeStack: Effect[] = []

export function getActiveEffect(): Effect | undefined {
  return activeStack[activeStack.length - 1]
}

export class Effect<T = any> {
  id: string
  name: string

  constructor(public fn: () => T) {
    this.id = uuidv4()
    this.name = fn.name
  }

  run() {
    activeStack.push(this)

    const result = this.fn()

    activeStack.pop()

    return result
  }
}

interface Runner<T = any> {
  effect: Effect

  (): T
}

export const pack: Set<Effect> = new Set()

export function effect<T = any>(fn: () => T): Runner<T> {
  const _effect = new Effect(fn)

  pack.add(_effect)

  _effect.run()

  const runner = _effect.run.bind(_effect) as Runner<T>

  runner.effect = _effect

  return runner
}
