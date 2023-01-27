import { computed, reactive } from '@euv/react'

const value = reactive<{ foo?: number }>({})

function spy() {
  return value.foo
}

const cValue = computed(spy)

// expect(cValue.value).toBe(undefined)
console.log(cValue.value)

value.foo = 1

// expect(cValue.value).toBe(1)
console.log(cValue.value)
