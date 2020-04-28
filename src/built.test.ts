import { build } from './build';

class Text {
  nodeValue = null;
  constructor(value: string) {
    this.nodeValue = value;
  }
}

class SVG {
  childNodes = [];
}

beforeEach(() => {
  document.createElement = jest.fn((name) => `ELEMENT:${name}` as any);
  document.createElementNS = jest.fn((_, name) => `SVG:${name}` as any);
  (global as any).Text = Text;
  (global as any).SVGElement = SVG;
});

describe('element', () => {
  test('handles simple element creation', async () => {
    const next: any = {
      type: 'FOO',
    };
    const previous: any = {};
    const parent: any = {
      childNodes: [],
    };

    const output = await build(next, previous, parent);

    expect(document.createElement).toBeCalledTimes(1);
    expect(document.createElement).toBeCalledWith('FOO');
    expect(output).toBe('ELEMENT:FOO');
  });

  test('doesn\'t fail if previous node not defined', async () => {
    const next: any = {
      type: 'FOO',
    };
    const previous: any = undefined;
    const parent: any = {
      childNodes: [],
    };

    const output = await build(next, previous, parent);

    expect(document.createElement).toBeCalledTimes(1);
    expect(document.createElement).toBeCalledWith('FOO');
    expect(output).toBe('ELEMENT:FOO');
  });

  test('doesn\'t fail if parent not defined', async () => {
    const next: any = {
      type: 'FOO',
    };
    const previous: any = undefined;
    const parent: any = undefined;

    const output = await build(next, previous, parent);

    expect(document.createElement).toBeCalledTimes(1);
    expect(document.createElement).toBeCalledWith('FOO');
    expect(output).toBe('ELEMENT:FOO');
  });
});

describe('svg', () => {
  test('handles simple svg element creation', async () => {
    const next: any = {
      type: 'svg',
    };
    const previous: any = {};
    const parent: any = {
      childNodes: [],
    };

    const output = await build(next, previous, parent);

    expect(document.createElementNS).toBeCalledTimes(1);
    expect(document.createElementNS).toBeCalledWith('http://www.w3.org/2000/svg', 'svg');
    expect(output).toBe('SVG:svg');
  });

  test('handles nested svg element creation', async () => {
    const next: any = {
      type: 'image',
    };
    const previous: any = {};
    const parent: any = new SVG();

    const output = await build(next, previous, parent);

    expect(document.createElementNS).toBeCalledTimes(1);
    expect(document.createElementNS).toBeCalledWith('http://www.w3.org/2000/svg', 'image');
    expect(output).toBe('SVG:image');
  });
});

describe('text', () => {
  let previous: any;
  let next: any;
  let parent: any;

  beforeEach(() => {
    next = {
      type: '',
      props: 'Hello world'
    };
    previous = {};
    parent = {
      childNodes: [],
    };
  });

  test('handles value `"Hello world"`', async () => {
    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('Hello world');
  });

  test('handles value `123`', async () => {
    next.props = 123;

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('123');
  });

  test('handles value `{}`', async () => {
    next.props = {};

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('[object Object]');
  });

  test('handles value `undefined`', async () => {
    next.props = undefined;

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('');
  });

  test('handles value `null`', async () => {
    next.props = null;

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('');
  });

  test('handles value `false`', async () => {
    next.props = false;

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('');
  });

  test('handles value `true`', async () => {
    next.props = true;

    const output = await build(next, previous, parent);

    expect(output instanceof Text).toBe(true);
    expect(output.nodeValue).toBe('');
  });
});

describe('patch', () => {
  describe('text', () => {
    let previous: any;
    let next: any;
    let parent: any;

    beforeEach(() => {
      next = {
        type: '',
        props: 'Hello world'
      };
      previous = {
        type: '',
        props: 'foo',
        target: new Text('foo'),
      };
      parent = {
        childNodes: [],
      };
    });

    test('patches value `"Hello world"`', async () => {
      parent.childNodes.push(previous.target);
      const output = await build(next, previous, parent);

      expect(output).toBe(previous.target);
      expect(output.nodeValue).toBe('Hello world');
    });

    test('skips replacing value if they are equal', async () => {
      parent.childNodes.push(previous.target);
      previous.props = 'Hello world';
      const output = await build(next, previous, parent);

      expect(output).toBe(previous.target);
      expect(output.nodeValue).toBe('foo');
    });

    test('skips patch if target not part of container', async () => {
      const output = await build(next, previous, parent);

      expect(output).not.toBe(previous.target);
      expect(output.nodeValue).toBe('Hello world');
    });
  });

  describe('element', () => {
    let previous: any;
    let next: any;
    let parent: any;

    beforeEach(() => {
      next = {
        type: 'div',
        props: {
          a: 1,
        },
        key: 1,
      };
      previous = {
        type: 'div',
        props: {
          a: 1,
        },
        key: 1,
        target: 'TARGET',
      };
      parent = {
        childNodes: [],
      };
    });

    test('patches element', async () => {
      parent.childNodes.push(previous.target);
      const output = await build(next, previous, parent);

      expect(document.createElement).not.toBeCalled();
      expect(output).toBe('TARGET');
    });

    test('skips patch if element not under same parent', async () => {
      const output = await build(next, previous, parent);

      expect(document.createElement).toBeCalledTimes(1);
      expect(document.createElement).toBeCalledWith('div');
      expect(output).toBe('ELEMENT:div');
    });

    test('skips patch if element type differs', async () => {
      previous.type = 'section';
      parent.childNodes.push(previous.target);
      const output = await build(next, previous, parent);

      expect(document.createElement).toBeCalledTimes(1);
      expect(document.createElement).toBeCalledWith('div');
      expect(output).toBe('ELEMENT:div');
    });

    test('doesn\'t reset props and key if same parent', async () => {
      parent.childNodes.push(previous.target);
      await build(next, previous, parent);

      expect(previous.props).toEqual(next.props);
      expect(previous.key).toEqual(next.key);
    });

    test('resets props and key if not same parent', async () => {
      await build(next, previous, parent);

      expect(previous.props).toEqual({});
      expect(previous.key).toEqual(null);
    });
  });
});

test('returns `.target` if it\'s set', async () => {
  const next: any = {
    target: 'FOO'
  };
  const previous: any = undefined;
  const parent: any = undefined;

  const output = await build(next, previous, parent);

  expect(document.createElement).not.toBeCalled();
  expect(output).toBe('FOO');
});
