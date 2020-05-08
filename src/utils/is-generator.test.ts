import { isGenerator } from './is-generator';

test('returns false if passed `undefined`', () => {
  const input = undefined;
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns false if passed `null`', () => {
  const input = null;
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns false if passed "foo"', () => {
  const input = 'foo';
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns false if passed `{}`', () => {
  const input = {};
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns false if passed `() => {}`', () => {
  const input = (): void => { };
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns false if passed Generator', () => {
  function* input(): Generator { }
  const output = isGenerator(input);

  expect(output).toBe(false);
});

test('returns true if passed Generator instance', () => {
  function* input(): Generator { }
  const output = isGenerator(input());

  expect(output).toBe(true);
});
