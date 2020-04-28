import { asyncMap } from './async-map';

let fn: any;

beforeEach(() => {
  fn = jest.fn((value) => `T:${value}`);
});

test('parses data just like regular map', async () => {
  const input = [1,2,3];

  const output = await asyncMap(input, fn);

  expect(fn).toBeCalledTimes(3);
  expect(fn).toBeCalledWith(1, 0);
  expect(fn).toBeCalledWith(2, 1);
  expect(fn).toBeCalledWith(3, 2);
  expect(output).toEqual([
    'T:1',
    'T:2',
    'T:3',
  ]);
});
