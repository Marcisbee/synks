import { render } from './render';
import { VNode } from '../types';

export async function mount(
  node: VNode | VNode[],
  container: HTMLElement = document.body,
  previousNode: VNode | VNode[] = node.constructor()
): Promise<VNode | VNode[]> {
  if (!(container instanceof HTMLElement)) {
    throw new Error('[Synks] Container should be valid HTMLElement');
  }

  if (!(node instanceof Array)) {
    node = [node];
  }

  return await render(node, previousNode as VNode, container, 0, {});
}
