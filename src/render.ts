import { VNode, NodeContext, Scope, VNodeProps, GeneratorRenderer } from '../types';

import { renderChildren } from './render-children';
import { patchProps } from './patch-props';
import { build } from './build';
import { removeStranglers } from './remove-stranglers';
import { removeNode } from './remove-node';
import { quickEqual } from './utils/quick-equal';
import { arrayUnique } from './utils/array-unique';
import { transformNode } from './transform-node';
import { handleCustomYields } from './yields';
import { isContext } from './yields/context';

let updateQueue = [];

export function isGenerator(value: any): value is GeneratorRenderer {
  return value && typeof value.next === 'function' && typeof value.throw === 'function';
}

export async function render(
  currentNode: VNode | VNode[],
  previousNode: VNode = currentNode && currentNode.constructor(),
  container: HTMLElement,
  childIndex: number,
  context: NodeContext
): Promise<VNode | VNode[]> {
  if (currentNode === undefined || currentNode === null) {
    return transformNode();
  }

  if (currentNode instanceof Array) {
    const prevNodes = previousNode instanceof Array ? previousNode : [previousNode];
    return await renderChildren(currentNode.map(transformNode), prevNodes, container, childIndex, context);
  }

  currentNode = transformNode(currentNode);

  if (previousNode && previousNode.type instanceof Function && currentNode && currentNode.type !== previousNode.type) {
    const cachedTarget = previousNode && Object.assign({}, previousNode.instance);

    if (previousNode.scope) {
      await previousNode.scope.destroy();
    }

    if (cachedTarget) {
      removeNode(cachedTarget);
    }
  }

  // Component
  if (currentNode.type instanceof Function) {
    const fn = currentNode.type;

    // Context
    if (isContext(fn)) {
      const currentContext = new fn(currentNode.props);
      const name = fn.name;
      const events = [];

      const nextFn = async (newContext: Record<string, any>): Promise<void> => {
        updateQueue = arrayUnique(events.concat(updateQueue));
        Object.assign(currentContext, newContext);

        const cache = updateQueue.slice().filter((d) => d.mounted && !d.rendering);
        updateQueue = [];

        for (const event of cache) {
          if (event.mounted && !event.rendering) {
            await event.next();
          }
        }
      };
      currentContext.__update = async (): Promise<any> => await nextFn.call(currentContext);
      const ctx = [currentContext, nextFn];

      context[name] = [ctx, events];

      // Render children
      const output = await render(currentNode.children, previousNode.children as any, container, childIndex, context);

      return output;
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

      currentNode.props = props;

      await output.scope.nextProps(props);

      return output;
    }

    // Regular component
    let output: VNode | VNode[];
    const originalProps = Object.assign({}, currentNode.props, {
      children: currentNode.children,
    });

    const scope: Scope = {
      mounted: true,
      rendering: false,
      _c: [],
      async onMount() { },
      async onDestroy() { },
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
        await renderSelf((currentNode as VNode).instance, props);

        scope.rendering = false;
      },
      async destroy() {
        if (!scope.mounted) {
          return;
        }

        scope.mounted = false;

        await scope.onDestroy();

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

    let generator: GeneratorRenderer;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line no-inner-declarations
    async function renderSelf(previousTree: VNode | VNode[], props: VNodeProps = originalProps): Promise<VNode | VNode[]> {
      Object.assign(originalProps, props);

      if (typeof fn === 'function') {
        output = await fn.call(scope, props);

        // Generator component
        if (isGenerator(output)) {
          if (!generator) {
            generator = output;
          }

          output = await handleCustomYields(
            generator,
            output,
            scope,
            currentNode as VNode,
            context
          );
        }
      }

      const rendered = await render(output, previousTree as VNode, container, childIndex, newContext);
      if (!(currentNode instanceof Array)) {
        currentNode.instance = output;
      }

      Object.assign(previousNode, currentNode);
      if (previousTree) {
        Object.assign(previousTree, rendered);
      }

      previousNode.target = null;

      return rendered;
    }

    await renderSelf(previousNode);

    scope.onMount();

    return currentNode;
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
