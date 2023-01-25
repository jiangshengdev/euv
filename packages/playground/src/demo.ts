import { effect, reactive } from '@euv/react'

const nums = reactive({ num1: 0, num2: 1, num3: 2 })
const dummy: any = {}

function childUpdate() {
  return (dummy.num1 = nums.num1)
}

const childEffect = effect(childUpdate)

function parentUpdate() {
  dummy.num2 = nums.num2
  childEffect()
  dummy.num3 = nums.num3
}

effect(parentUpdate)

// this should only call the childEffect
nums.num1 = 4

// this calls the parentEffect, which calls the childEffect once
nums.num2 = 10

// this calls the parentEffect, which calls the childEffect once
nums.num3 = 7
