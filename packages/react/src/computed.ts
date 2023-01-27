import { isFunction, NOOP } from '@euv/shared'
import { Effect } from './effect'

type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void

interface ComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

class Computed<T> {
  public effect: Effect<T>
  public _dirty = true

  constructor(getter: ComputedGetter<T>, private _setter: ComputedSetter<T>) {
    const effect = new Effect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })

    this.effect = effect
  }

  private _value!: T
  get value() {
    if (this._dirty) {
      this._dirty = false

      const value = this.effect.run()

      this._value = value
    }

    return this._value
  }

  set value(newValue: T) {
    this._setter(newValue)
  }
}

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | ComputedOptions<T>
): Computed<T> {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>
  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new Computed(getter, setter)
}
