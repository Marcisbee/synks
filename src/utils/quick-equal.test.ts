import { quickEqual } from './quick-equal';

test.each([
  [undefined, undefined],
  [null, null],
  [1, 1],
  ['1', '1'],
  [{}, {}],
  [{ a: 1 }, { a: 1 }],
  [{ a: 1, b: 2 }, { b: 2, a: 1 }],
  [{ a: 1, b: [1, 2, 3] }, { b: [1, 2, 3], a: 1 }],
])('returns `true` with input %s and %s', (a, b) => {
  expect(quickEqual(a as any, b as any)).toBe(true);
});

test.each([
  [undefined, 0],
  [null, 0],
  [null, undefined],
  [1, '1'],
  [{ a: 1 }, { a: 2 }],
  [{ a: 1, b: 2 }, { b: 3, a: 1 }],
  [{ a: 1, b: [1, 2, 3] }, { b: [1, 3, 2], a: 1 }],
])('returns `false` with input %s and %s', (a, b) => {
  expect(quickEqual(a as any, b as any)).toBe(false);
});
