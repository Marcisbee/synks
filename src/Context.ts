import { ContextInterface } from "../types/index.d";
import { UPDATE_CONTEXT } from "./symbols";

export class Context implements ContextInterface {
  constructor() {
    const keys = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    );

    keys.forEach((key) => {
      const value = this[key];

      if (value instanceof Function) {
        this[key] = (...args: any[]): any => {
          const output = value.apply(this, args);

          this[UPDATE_CONTEXT]();

          return output;
        };
      }
    });
  }

  [UPDATE_CONTEXT](): void { }
}
