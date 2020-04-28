import { VNode, NodeContext, Scope } from '../types';

import { renderChildren } from './render-children';
import { patchProps } from './patch-props';
import { build } from './build';
import { removeStranglers } from './remove-stranglers';
import { removeNode } from './remove-node';
import { quickEqual } from './utils/quick-equal';
import { AsyncGeneratorFunction, GeneratorFunction } from './utils/generators';

export async function render(
  currentNode: VNode | VNode[],
  previousNode: VNode = currentNode.constructor(),
  container: HTMLElement,
  childIndex: number,
  context: NodeContext
): Promise<VNode | VNode[]> {
  if (currentNode instanceof Array) {
    return await renderChildren(currentNode, previousNode, container, childIndex, context);
  }

  // Component
  if (currentNode.type instanceof Function) {
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

      if (key1 === key2 || quickEqual(props, props2)) {
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
      async *[(Symbol as any).asyncIterator]() {

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
    // eslint-disable-next-line no-inner-declarations
    async function renderSelf(previousTree: VNode | VNode[], props: null | Record<string, any> = originalProps): Promise<VNode | VNode[]> {
      Object.assign(originalProps, props);

      // Generator component
      if ((fn instanceof AsyncGeneratorFunction || fn instanceof GeneratorFunction) && typeof fn === 'function') {
        if (!generator) {
          generator = await fn.call(scope, props);
        }

        output = (await generator.next()).value;
      } else {
        output = await fn.call(scope, props);
      }

      if (fn instanceof AsyncGeneratorFunction) {
        scope.next();
      }

      const rendered = await render(output, previousTree as any, container, childIndex, newContext);
      (currentNode as any).instance = output;

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
  await renderChildren(currentNode.children, previousNode.children, currentNode.target as HTMLElement, 0, context);

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
