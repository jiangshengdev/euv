class Effect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    let result = this.fn()

    return result
  }
}

export function effect<T = any>(fn: () => T) {
  let _effect = new Effect(fn)

  _effect.run()
}
