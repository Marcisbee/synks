export function isGenerator<T>(value: any): value is T {
  return !!value && typeof value.next === 'function' && typeof value.throw === 'function';
}
