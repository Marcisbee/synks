export function isGeneratorFunction(fn: any): boolean {
  return typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'GeneratorFunction'
}

export function isAsyncGeneratorFunction(fn: any): boolean {
  return typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'AsyncGeneratorFunction'
}
