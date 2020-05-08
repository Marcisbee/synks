import { arrayUnique } from './array-unique';

test('returns same array', () => {
  const input = [1, 2, 3];
  const expected = [1, 2, 3];

  const output = arrayUnique(input);

  expect(output).toEqual(expected);
});

test('leaves only unique primitives', () => {
  const input = [1, 1, 2, true, 'foo', 'bar', 'foo', true];
  const expected = [1, 2, true, 'foo', 'bar'];

  const output = arrayUnique(input);

  expect(output).toEqual(expected);
});

test('leaves only unique objects', () => {
  const sameObject = {};
  const sameArray = {};
  const sameFn = (): number => 1;
  const anotherFn = (): number => 2;
  const input = [
    sameObject,
    sameArray,
    sameObject,
    sameArray,
    sameFn,
    sameFn,
    anotherFn,
  ];
  const expected = [sameObject, sameArray, sameFn, anotherFn];

  const output = arrayUnique(input);

  expect(output).toEqual(expected);
});
