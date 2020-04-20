
export class Context {
  constructor() {
    const keys = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    );

    keys.forEach((key) => {
      if (key === 'update') return;

      const value = this[key];

      if (value instanceof Function) {
        this[key] = (...args) => {
          const output = value.apply(this, args);

          this.__update();

          return output;
        };
      }
    });
  }

  __update() { }
}
