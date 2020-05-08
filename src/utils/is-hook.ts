import { Hook } from "../../types";
import { isGenerator } from "./is-generator";

export function isHook(value: any): value is Hook {
  return isGenerator(value);
}
