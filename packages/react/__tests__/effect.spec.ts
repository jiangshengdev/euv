import { effect, reactive } from '@euv/react'

describe('react/effect', () => {
  it('should run the passed function once (wrapped by a effect)', () => {
    let counter = 0

    const update = function update() {
      counter++
    }

    effect(update)

    console.assert(Object.is(counter, 1))
  })

  it('should observe basic properties', () => {
    let dummy

    const counter = reactive({
      num: 0
    })

    let update = function update() {
      dummy = counter.num
    }

    effect(update)

    console.assert(Object.is(dummy, 0))

    counter.num = 7

    console.assert(Object.is(dummy, 7))
  })
})
