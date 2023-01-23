export function reactive(target: object): object | any {
  let proxy = new Proxy(target, {})

  return proxy
}
