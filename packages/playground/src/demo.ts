import { computed, effect, reactive } from '@euv/react'

const value = reactive<{ foo?: number }>({})

function getter() {
  return value.foo
}

const cValue = computed(getter)
let dummy

function spy() {
  dummy = cValue.value
}

effect(spy)

// expect(dummy).toBe(undefined)
console.log(dummy)

value.foo = 1

// expect(dummy).toBe(1)
console.log(dummy)
