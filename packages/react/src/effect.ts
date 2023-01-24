export class Effect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeStack.push(this)

    let result = this.fn()

    activeStack.pop()

    return result
  }
}

export let activeStack: Effect[] = []

export function getActiveEffect(): Effect | undefined {
  return activeStack[activeStack.length - 1]
}

interface Runner<T = any> {
  effect: Effect

  (): T
}

export function effect<T = any>(fn: () => T): Runner<T> {
  let _effect = new Effect(fn)

  _effect.run()

  let runner = _effect.run.bind(_effect) as Runner<T>
  runner.effect = _effect
  return runner
}
