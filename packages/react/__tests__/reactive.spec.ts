import { reactive } from '@euv/react'
import { looseEqual } from '@euv/shared'

describe('react/reactive', () => {
  test('Object', () => {
    const original = {
      foo: 1
    }
    const observed = reactive(original)

    console.assert(!Object.is(observed, original))

    // get
    console.assert(Object.is(observed.foo, 1))

    // has
    console.assert(Object.is('foo' in observed, true))

    // ownKeys
    console.assert(looseEqual(Object.keys(observed), ['foo']))
  })

  test('observed value should proxy mutations to original (Object)', () => {
    const original: any = {
      foo: 1
    }
    const observed = reactive(original)

    // set
    observed.bar = 1
    console.assert(Object.is(observed.bar, 1))
    console.assert(Object.is(original.bar, 1))

    // delete
    delete observed.foo
    console.assert(Object.is('foo' in observed, false))
    console.assert(Object.is('foo' in original, false))
  })

  test('original value change should reflect in observed value (Object)', () => {
    const original: any = {
      foo: 1
    }
    const observed = reactive(original)

    // set
    original.bar = 1
    console.assert(Object.is(original.bar, 1))
    console.assert(Object.is(observed.bar, 1))

    // delete
    delete original.foo
    console.assert(Object.is('foo' in original, false))
    console.assert(Object.is('foo' in observed, false))
  })
})
