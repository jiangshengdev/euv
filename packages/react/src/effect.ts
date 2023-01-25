export const activeStack: Effect[] = []

export function getActiveEffect(): Effect | undefined {
  return activeStack[activeStack.length - 1]
}

export class Effect<T = any> {
  constructor(public fn: () => T) {}

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

export function effect<T = any>(fn: () => T): Runner<T> {
  const _effect = new Effect(fn)

  _effect.run()

  const runner = _effect.run.bind(_effect) as Runner<T>

  runner.effect = _effect

  return runner
}
