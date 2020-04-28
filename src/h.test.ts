import { h } from './h';
import { transformChildren } from './transform-children';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  transformChildren = jest.fn(() => 'TRANSFORMED CHILDREN');
});

test('creates simple "div" node', () => {
  const type = 'div';
  const props = {};
  const children = [];

  const output = h(type, props, ...children);

  expect(transformChildren).toBeCalledTimes(0);
  expect(output).toEqual({
    type: 'div',
    props: {},
    key: null,
    children: [],
  });
});

test('creates "div" node with children', () => {
  const type = 'div';
  const props = {};
  const children = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(transformChildren).toBeCalledTimes(1);
  expect(transformChildren).toBeCalledWith(['1']);
  expect(output).toEqual({
    type: 'div',
    props: {},
    key: null,
    children: 'TRANSFORMED CHILDREN',
  });
});

test('creates "div" node with key', () => {
  const type = 'div';
  const props = {
    key: '2',
  };
  const children = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(transformChildren).toBeCalledTimes(1);
  expect(transformChildren).toBeCalledWith(['1']);
  expect(output).toEqual({
    type: 'div',
    props: {
      key: '2',
    },
    key: '2',
    children: 'TRANSFORMED CHILDREN',
  });
});

test('creates "div" node with multiple props', () => {
  const type = 'div';
  const props = {
    key: '2',
    a: 1,
    b: false,
  };
  const children = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(transformChildren).toBeCalledTimes(1);
  expect(transformChildren).toBeCalledWith(['1']);
  expect(output).toEqual({
    type: 'div',
    props: {
      key: '2',
      a: 1,
      b: false,
    },
    key: '2',
    children: 'TRANSFORMED CHILDREN',
  });
});

test('creates simple text node', () => {
  const type = '';
  const props: any = 'Hello world';

  const output = h(type, props);

  expect(transformChildren).toBeCalledTimes(0);
  expect(output).toEqual({
    type: '',
    props: 'Hello world',
    key: null,
    children: [],
  });
});
