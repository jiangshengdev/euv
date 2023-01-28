import { computed, effect, reactive } from '@euv/react'

const value = reactive<{ foo?: number }>({})
const cValue = computed(() => value.foo)
let dummy

effect(() => {
  dummy = cValue.value
})

// expect(dummy).toBe(undefined)
console.log(dummy)

value.foo = 1

// expect(dummy).toBe(1)
console.log(dummy)
