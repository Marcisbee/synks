import { VNode } from '../types';

import { render } from './render';

export async function mount(
  node: VNode | VNode[],
  container: HTMLElement = document.body,
  previousNode: VNode | VNode[] = node.constructor()
): Promise<VNode | VNode[]> {
  if (!(node instanceof Array)) {
    node = [node];
  }

  return await render(node, previousNode as VNode, container, 0, {});
}
