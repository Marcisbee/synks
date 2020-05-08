import { ContextFunction } from "../../types";
import { Context } from "../Context";

export function isContext(value: any): value is ContextFunction {
  return value && Object.getPrototypeOf(value) === Context;
}
