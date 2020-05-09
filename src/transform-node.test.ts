import { transformNode } from './transform-node';

test('creates node from string', () => {
  const input = 'foo';

  const output = transformNode(input);

  expect(output).toEqual({
    type: '',
    props: 'foo',
    key: null,
  });
});

test('creates node from `undefined`', () => {
  const input = undefined;

  const output = transformNode(input);

  expect(output).toEqual({
    type: '',
    props: undefined,
    key: null,
  });
});

test('creates node from `null`', () => {
  const input = null;

  const output = transformNode(input);

  expect(output).toEqual({
    type: '',
    props: null,
    key: null,
  });
});

test('creates node from array of strings', () => {
  const input: any = ['foo', 'bar'];

  const output = transformNode(input);

  expect(output).toEqual(input);
  expect(output).toEqual([
    {
      type: '',
      props: 'foo',
      key: null,
    },
    {
      type: '',
      props: 'bar',
      key: null,
    },
  ]);
});

test('creates node from vnode', () => {
  const input: any = {
    type: 'div',
    props: {},
    children: [],
  };

  const output = transformNode(input);

  expect(output).toEqual(input);
  expect(output).toEqual({
    type: 'div',
    props: {},
    children: [],
    scope: null,
    target: null,
    instance: null,
    key: null,
  });
});

test('clears vnode params correctly', () => {
  const input: any = {
    type: 'div',
    props: {
      foo: 0,
    },
    key: 0,
    children: [],
    scope: 1,
    target: 1,
    instance: 1,
  };

  const output = transformNode(input);

  expect(output).toEqual(input);
  expect(output).toEqual({
    type: 'div',
    props: {
      foo: 0,
    },
    children: [],
    scope: null,
    target: null,
    instance: null,
    key: 0,
  });
});

test('handles vnode children correctly', () => {
  const type = (): void => { };
  const input: any = {
    type: 'div',
    props: {},
    children: [
      1,
      0,
      undefined,
      {
        type,
        props: {
          foo: 1,
        },
        children: [],
      },
    ],
  };

  const output = transformNode(input);

  expect(output).toEqual(input);
  expect(output).toEqual({
    type: 'div',
    props: {},
    children: [
      {
        type: '',
        props: 1,
        children: undefined,
        key: null,
      },
      {
        type: '',
        props: 0,
        children: undefined,
        key: null,
      },
      {
        type: '',
        props: undefined,
        children: undefined,
        key: null,
      },
      {
        type,
        props: {
          foo: 1,
        },
        children: [],
        scope: null,
        target: null,
        instance: null,
        key: null,
      },
    ],
    scope: null,
    target: null,
    instance: null,
    key: null,
  });
});
