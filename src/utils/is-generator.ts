import { GeneratorRenderer } from "../../types";

export function isGenerator(value: any): value is GeneratorRenderer {
  return value && typeof value.next === 'function' && typeof value.throw === 'function';
}
