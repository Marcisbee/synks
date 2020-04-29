import { h } from './h';

test('creates simple "div" node', () => {
  const type = 'div';
  const props = {};
  const children = [];

  const output = h(type, props, ...children);

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
  const children: any = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(output).toEqual({
    type: 'div',
    props: {},
    key: null,
    children: ['1'],
  });
});

test('creates "div" node with key', () => {
  const type = 'div';
  const props = {
    key: '2',
  };
  const children: any = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(output).toEqual({
    type: 'div',
    props: {
      key: '2',
    },
    key: '2',
    children: ['1'],
  });
});

test('creates "div" node with multiple props', () => {
  const type = 'div';
  const props = {
    key: '2',
    a: 1,
    b: false,
  };
  const children: any = [
    '1'
  ];

  const output = h(type, props, ...children);

  expect(output).toEqual({
    type: 'div',
    props: {
      key: '2',
      a: 1,
      b: false,
    },
    key: '2',
    children: ['1'],
  });
});

test('creates simple text node', () => {
  const type = '';
  const props: any = 'Hello world';

  const output = h(type, props);

  expect(output).toEqual({
    type: '',
    props: 'Hello world',
    key: null,
    children: [],
  });
});
