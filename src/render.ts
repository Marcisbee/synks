import { renderChildren } from "./render-children";
import { patchProps } from "./patch-props";
import { build } from "./build";
import { removeStranglers } from "./remove-stranglers";
import { removeNode } from "./remove-node";

export async function render(
  currentNode: VNode | VNode[],
  previousNode: VNode = currentNode.constructor(),
  container: HTMLElement,
  childIndex: number,
  context: Context
): Promise<VNode | VNode[]> {
  if (currentNode instanceof Array) {
    return await renderChildren(currentNode, previousNode, container, childIndex, context);
  }

  // Destroy previous component
  if (previousNode.scope) {
    await previousNode.scope.destroy();
  }

  // Component
  if (currentNode.type instanceof Function) {
    currentNode.target = container;

    // Regular component
    let output: VNode | VNode[];
    const scope: Scope = {
      times: 0,
      name: currentNode.type.name,
      mounted: true,
      _c: [],
      async next() {
        scope.times++;
        if (!scope.mounted) {
          return;
        }

        await render(
          currentNode,
          previousNode,
          container,
          childIndex,
          context,
        );
      },
      // async *[(Symbol as any).asyncIterator]() {
      //   asyncIterator = true;
      //   yield {
      //     ...node.props,
      //     children: node.children
      //   };
      // },
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

    const props = Object.assign({}, currentNode.props, {
      children: currentNode.children,
    });

    currentNode.scope = scope;

    const fn = currentNode.type;
    // eslint-disable-next-line no-inner-declarations
    async function renderSelf(previousTree: VNode | VNode[]): Promise<VNode | VNode[]> {
      output = fn.call(scope, props);

      const rendered = await render(output, previousTree as any, container, childIndex, newContext);
      (currentNode as any).instance = output;

      Object.assign(previousNode, currentNode);

      previousNode.target = null;

      return rendered;
    }

    await renderSelf(previousNode.instance || previousNode);

    return currentNode;
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
