import { effect } from '@euv/react'

describe('react/effect', () => {
  it('should run the passed function once (wrapped by a effect)', () => {
    let count = 0

    const fn = function fn() {
      count++
    }

    effect(fn)

    console.assert(Object.is(count, 1))
  })
})
