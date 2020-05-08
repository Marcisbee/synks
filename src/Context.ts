import { ContextInterface } from "../types/index.d";

export class Context implements ContextInterface {
  constructor() {
    const keys = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    );

    keys.forEach((key) => {
      if (key === '__update') return;

      const value = this[key];

      if (value instanceof Function) {
        this[key] = (...args: any[]): any => {
          const output = value.apply(this, args);

          this.__update();

          return output;
        };
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  __update() { }
}
