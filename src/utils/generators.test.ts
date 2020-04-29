/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
import { isAsyncGeneratorFunction, isGeneratorFunction } from './generators';

describe('isGeneratorFunction', () => {
  test('generator should be instance', () => {
    function* Sample() { }

    expect(isGeneratorFunction(Sample)).toBe(true);
  });

  test('simple function should not be this instance', () => {
    function Sample() { }

    expect(isGeneratorFunction(Sample)).toBe(false);
  });

  test('async generator should not be instance', () => {
    async function* Sample() { }

    expect(isGeneratorFunction(Sample)).toBe(false);
  });
})

describe('isAsyncGeneratorFunction', () => {
  test('async generator should be instance', () => {
    async function* Sample() { }

    expect(isAsyncGeneratorFunction(Sample)).toBe(true);
  });

  test('generator should not be instance', () => {
    function* Sample() { }

    expect(isAsyncGeneratorFunction(Sample)).toBe(false);
  });

  test('simple function should not be instance', () => {
    function Sample() { }

    expect(isAsyncGeneratorFunction(Sample)).toBe(false);
  });
})
