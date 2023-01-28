import { v4 as uuidv4 } from 'uuid'
import { getFnContent, isFunction, NOOP } from '@euv/shared'
import { Effect } from './effect'
import { trackEffects, triggerEffects } from './reactive'

type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void

interface ComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

export const calculator: Set<Computed<any>> = new Set()

export class Computed<T> {
  public effect: Effect<T>
  public _dirty = true
  public dep?: Set<Effect>
  id: string
  content: string

  constructor(getter: ComputedGetter<T>, private _setter: ComputedSetter<T>) {
    const effect = new Effect(getter, () => {
      if (!this._dirty) {
        this._dirty = true

        if (this.dep) {
          triggerEffects(this.dep)
        }
      }
    })

    this.effect = effect
    this.id = uuidv4()
    this.content = getFnContent(getter)
    calculator.add(this)
  }

  private _value!: T
  get value() {
    if (!this.dep) {
      this.dep = new Set()
    }

    trackEffects(this.dep)

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
