import { Context } from "../Context";
import { ContextFunction } from "../../types";

export function isContext(value: any): value is ContextFunction {
  return !!value && Object.getPrototypeOf(value) === Context;
}
