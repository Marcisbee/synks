/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
import { AsyncGeneratorFunction, GeneratorFunction } from './generators';

describe('GeneratorFunction', () => {
  test('generator should be instance', () => {
    function* Sample() { }

    expect(Sample instanceof GeneratorFunction).toBe(true);
  });

  test('simple function should not be this instance', () => {
    function Sample() { }

    expect(Sample instanceof GeneratorFunction).toBe(false);
  });

  test('async generator should not be instance', () => {
    async function* Sample() { }

    expect(Sample instanceof GeneratorFunction).toBe(false);
  });
})

describe('AsyncGeneratorFunction', () => {
  test('async generator should be instance', () => {
    async function* Sample() { }

    expect(Sample instanceof AsyncGeneratorFunction).toBe(true);
  });

  test('generator should not be instance', () => {
    function* Sample() { }

    expect(Sample instanceof AsyncGeneratorFunction).toBe(false);
  });

  test('simple function should not be instance', () => {
    function Sample() { }

    expect(Sample instanceof AsyncGeneratorFunction).toBe(false);
  });
})
