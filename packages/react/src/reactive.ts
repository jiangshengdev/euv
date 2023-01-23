export function reactive(target: object): object | any {
  let proxy = new Proxy(target, {
    get(target: object, key: string | symbol, receiver: any): any {
      let result = Reflect.get(target, key, receiver)

      return result
    },
    set(
      target: object,
      key: string | symbol,
      value: any,
      receiver: any
    ): boolean {
      let result = Reflect.set(target, key, value, receiver)

      return result
    }
  })

  return proxy
}
