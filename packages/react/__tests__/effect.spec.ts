import { effect, reactive } from '@euv/react'
import { looseEqual } from '@euv/shared'

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

  it('should observe multiple properties', () => {
    let dummy

    const counter = reactive({
      num1: 0,
      num2: 0
    })

    const update = function update() {
      let a = counter.num1
      let b = counter.num1
      let c = counter.num2

      dummy = a + b + c
    }

    effect(update)

    console.assert(Object.is(dummy, 0))

    counter.num2 = 7
    counter.num1 = 7

    console.assert(Object.is(dummy, 21))
  })

  it('should handle multiple effects', () => {
    let dummy1
    let dummy2

    const counter = reactive({
      num: 0
    })

    let update1 = function update1() {
      dummy1 = counter.num
    }

    let update2 = function update2() {
      dummy2 = counter.num
    }

    effect(update1)
    effect(update2)

    console.assert(Object.is(dummy1, 0))
    console.assert(Object.is(dummy2, 0))

    counter.num++

    console.assert(Object.is(dummy1, 1))
    console.assert(Object.is(dummy2, 1))
  })

  it('should allow nested effects', () => {
    const nums = reactive({ num1: 0, num2: 1, num3: 2 })

    const counter = {
      parent: 0,
      child: 0
    }

    interface Dummy {
      num1?: number
      num2?: number
      num3?: number
    }

    const dummy: Dummy = {}

    const childUpdate = function () {
      counter.child++
      return (dummy.num1 = nums.num1)
    }

    const childEffect = effect(childUpdate)

    const parentUpdate = function parentUpdate() {
      counter.parent++
      dummy.num2 = nums.num2
      childEffect()
      dummy.num3 = nums.num3
    }

    effect(parentUpdate)

    console.assert(looseEqual(dummy, { num1: 0, num2: 1, num3: 2 }))
    console.assert(Object.is(counter.parent, 1))
    console.assert(Object.is(counter.child, 2))

    // this should only call the childEffect
    nums.num1 = 4

    console.assert(looseEqual(dummy, { num1: 4, num2: 1, num3: 2 }))
    console.assert(Object.is(counter.parent, 1))
    console.assert(Object.is(counter.child, 3))

    // this calls the parentEffect, which calls the childEffect once
    nums.num2 = 10
    console.assert(looseEqual(dummy, { num1: 4, num2: 10, num3: 2 }))
    console.assert(Object.is(counter.parent, 2))
    console.assert(Object.is(counter.child, 4))

    // this calls the parentEffect, which calls the childEffect once
    nums.num3 = 7
    console.assert(looseEqual(dummy, { num1: 4, num2: 10, num3: 7 }))
    console.assert(Object.is(counter.parent, 3))
    console.assert(Object.is(counter.child, 5))
  })
})
