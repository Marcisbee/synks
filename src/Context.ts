/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
export class Context {
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

  __update() {}
}
