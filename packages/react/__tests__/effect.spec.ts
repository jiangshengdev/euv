import { effect } from '@euv/react'

describe('react/effect', () => {
  it('should run the passed function once (wrapped by a effect)', () => {
    let dummy = 0

    const fnSpy = function fnSpy() {
      dummy++
    }

    effect(fnSpy)

    console.assert(Object.is(dummy, 1))
  })
})
