export class Effect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this

    let result = this.fn()

    activeEffect = undefined

    return result
  }
}

export let activeEffect: Effect | undefined

export function effect<T = any>(fn: () => T) {
  let _effect = new Effect(fn)

  _effect.run()
}
