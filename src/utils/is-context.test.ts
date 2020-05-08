import { Context } from '../Context';
import { isContext } from './is-context';

test('returns false if passed `undefined`', () => {
  const input = undefined;
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed `null`', () => {
  const input = null;
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed "foo"', () => {
  const input = 'foo';
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed `{}`', () => {
  const input = {};
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed `() => {}`', () => {
  const input = (): void => { };
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed Generator', () => {
  function* input(): Generator { }
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed Generator instance', () => {
  function* input(): Generator { }
  const output = isContext(input());

  expect(output).toBe(false);
});

test('returns false if passed Context', () => {
  const input = Context;
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns false if passed Context instance', () => {
  const input = new Context();
  const output = isContext(input);

  expect(output).toBe(false);
});

test('returns true if passed extended Context', () => {
  class Input extends Context { }
  const output = isContext(Input);

  expect(output).toBe(true);
});

test('returns false if passed extended Context instance', () => {
  class Input extends Context { }
  const output = isContext(new Input());

  expect(output).toBe(false);
});
