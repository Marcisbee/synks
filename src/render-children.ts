import { VNode, NodeContext } from '../types';

import { asyncMap } from './utils/async-map';
import { removeStranglers } from './remove-stranglers';
import { patchProps } from './patch-props';
import { render } from './render';

export async function renderChildren(
  currentChildren: VNode[],
  previousChildren: VNode[] | VNode,
  container: HTMLElement,
  parentIndex: number,
  context: NodeContext
): Promise<VNode[]> {
  let offset = parentIndex;
  const renderedData = await asyncMap(currentChildren, async (child, index) => {
    const previousNode = previousChildren && previousChildren[index];

    if (child instanceof Array) {
      const renderedData = await renderChildren(child, previousNode, container, offset + parseInt(index, 10), context);

      removeStranglers(previousNode);

      offset += Math.max([].concat(...renderedData).length - 1, 0);
      return renderedData;
    }

    // Handle keyed children
    if (child && child.key !== null && child.key !== undefined && previousNode && previousChildren instanceof Array) {
      if (previousNode.key === child.key) {
        child.target = previousNode.target;
        previousNode.target = null;

        patchProps(child, previousNode);

        return child;
      }

      const keyElement = previousChildren.find((p) => p.key === child.key);
      if (previousNode.key !== child.key && keyElement) {
        child.target = keyElement.target;
        keyElement.target = null;
      }
    }

    const output = await render(
      child,
      previousNode,
      container,
      parseInt(index, 10) + offset,
      context
    );

    if (output instanceof Array) {
      offset += Math.max([].concat(...output).length - 1, 0);
    }

    if (!(output instanceof Array) && output.instance instanceof Array) {
      offset += Math.max([].concat(...output.instance).length - 1, 0);
    }

    return output;
  });

  removeStranglers(previousChildren);

  return renderedData;
}
