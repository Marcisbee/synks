import { VNode, NodeContext, Scope, VNodeProps } from '../types';

import { renderChildren } from './render-children';
import { patchProps } from './patch-props';
import { build } from './build';
import { removeStranglers } from './remove-stranglers';
import { removeNode } from './remove-node';
import { quickEqual } from './utils/quick-equal';
import { Context } from './Context';
import { arrayUnique } from './utils/array-unique';
import { AsyncGeneratorFunction, GeneratorFunction } from './utils/generators';
import { transformNode } from './transform-node';

let updateQueue = [];

export async function render(
  currentNode: VNode | VNode[],
  previousNode: VNode = currentNode && currentNode.constructor(),
  container: HTMLElement,
  childIndex: number,
  context: NodeContext
): Promise<VNode | VNode[]> {
  if (currentNode === undefined || currentNode === null) {
    return transformNode(currentNode as null);
  }

  if (currentNode instanceof Array) {
    return await renderChildren(currentNode.map(transformNode), previousNode, container, childIndex, context);
  }

  currentNode = transformNode(currentNode);

  // Component
  if (currentNode.type instanceof Function) {
    const isContext = Object.getPrototypeOf(currentNode.type) === Context;

    // Context
    if (isContext) {
      const currentContext = new (currentNode.type as any)(currentNode.props);
      const name = currentNode.type.name;
      const events = [];

      const nextFn = async (newContext: Record<string, any>): Promise<void> => {
        updateQueue = arrayUnique(events.concat(updateQueue));
        Object.assign(currentContext, newContext);

        const cache = updateQueue.slice();
        updateQueue = [];
        cache.forEach((event) => {
          event.next();
        });
      };
      currentContext.__update = async (): Promise<any> => await nextFn.call(currentContext);
      const ctx = [currentContext, nextFn];

      // Render children
      return await render(currentNode.children, previousNode.children as any, container, childIndex, {
        ...context,
        [name]: [ctx, events],
      });
    }

    if (currentNode.type === previousNode.type && !!previousNode.instance) {
      const props = Object.assign({}, currentNode.props, {
        children: currentNode.children,
      });

      const props2 = Object.assign({}, previousNode.props, {
        children: previousNode.children,
      });

      const key1 = currentNode.key;
      const key2 = previousNode.key;

      const output = Object.assign(currentNode, previousNode);

      if (quickEqual(props, props2) || (key1 !== null && key1 === key2)) {
        return output;
      }

      await output.scope.nextProps(props);

      return output;
    }

    // Destroy previous component
    if (previousNode.scope) {
      await previousNode.scope.destroy();
    }

    // Regular component
    let output: VNode | VNode[];
    const fn = currentNode.type;
    const originalProps = Object.assign({}, currentNode.props, {
      children: currentNode.children,
    });

    const scope: Scope = {
      mounted: true,
      rendering: false,
      _c: [],
      async next() {
        if (!scope.mounted || scope.rendering) {
          return;
        }

        await this.nextProps(originalProps);
      },
      async nextProps(props) {
        if (!scope.mounted || scope.rendering) {
          return;
        }
        scope.rendering = true;

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await renderSelf(previousNode.instance, props);

        scope.rendering = false;
      },
      async *[Symbol.asyncIterator]() {

        yield originalProps;
      },
      async destroy() {
        if (!scope.mounted) {
          return;
        }

        scope.mounted = false;

        scope._c.forEach((s) => {
          s.destroy();
        });
        scope._c = [];

        const parentScopes = context.scope && context.scope._c;
        if (parentScopes) {
          context.scope._c = parentScopes.filter((s) => s.mounted);
        }
      },
    };

    if (context.scope) {
      context.scope._c.push(scope);
    }

    const newContext = Object.assign({}, context, {
      scope,
    });

    currentNode.scope = scope;

    let generator = null;
    let placeholder = null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line no-inner-declarations
    async function renderSelf(previousTree: VNode | VNode[], props: VNodeProps = originalProps): Promise<VNode | VNode[]> {
      Object.assign(originalProps, props);

      // Generator component
      if ((fn instanceof AsyncGeneratorFunction || fn instanceof GeneratorFunction) && typeof fn === 'function') {
        if (!generator) {
          generator = await fn.call(scope, props);
        }

        output = (await generator.next()).value;

        if (output) {
          let outputIsContext = Object.getPrototypeOf(output) === Context;
          if (outputIsContext) {
            do {
              const contextName = output && (output as unknown as Function).name;
              const currentContext = context[contextName];

              if (!currentContext) {
                throw new Error(`${contextName} was called in <${((currentNode as VNode).type as Function).name}> before it was defined`);
              }

              if (currentContext[1].indexOf(scope) === -1) {
                currentContext[1].push(scope);
              }

              output = (await generator.next(currentContext[0])).value;

              outputIsContext = Object.getPrototypeOf(output) === Context;
            } while (outputIsContext);
          }
        }
      } else {
        output = await fn.call(scope, props);
      }

      if (fn instanceof AsyncGeneratorFunction) {
        scope.next();
      }

      const rendered = await render(output, previousTree as VNode, container, childIndex, newContext);
      if (!(currentNode instanceof Array)) {
        currentNode.instance = output;
      }

      if (fn instanceof AsyncGeneratorFunction) {
        if (placeholder) {
          removeNode(placeholder);
          placeholder = null;
        }

        if (previousNode.instance && !(output instanceof Array) && !(previousNode.instance instanceof Array) && output.target !== previousNode.instance.target) {
          placeholder = previousNode.instance;
        }
      }

      Object.assign(previousNode, currentNode);
      if (previousTree) {
        Object.assign(previousTree, rendered);
      }

      previousNode.target = null;

      return rendered;
    }

    await renderSelf(previousNode);

    return currentNode;
  }

  if (previousNode.scope) {
    await previousNode.scope.destroy();
  }

  if (previousNode.instance) {
    removeNode(previousNode.instance);
  }

  const isKeyMoved = currentNode.target && previousNode.key !== undefined && previousNode.key !== null;

  currentNode.target = await build(currentNode, previousNode, container);

  // Patch props
  patchProps(currentNode, previousNode);

  if (isKeyMoved) {
    container.insertBefore(
      currentNode.target,
      container.childNodes[childIndex + 1]
    );

    return currentNode;
  }

  if (currentNode.target === previousNode.target || (previousNode.instance && previousNode.target === container)) {
    previousNode.target = null;
  }

  // Patch children
  if (currentNode.children instanceof Array) {
    await renderChildren(currentNode.children, previousNode.children, currentNode.target as HTMLElement, 0, context);
  }

  // Remove stranglers
  if (previousNode.target && previousNode.target.parentNode && previousNode.target !== currentNode.target && previousNode.target !== container) {
    removeNode(previousNode);
  }
  if (previousNode && previousNode.children) {
    removeStranglers(previousNode.children);
  }

  // Add element to dom
  if (!currentNode.target.parentNode) {
    container.insertBefore(
      currentNode.target,
      container.childNodes[childIndex]
    );
  }

  return currentNode;
}
