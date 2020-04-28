import { VNode } from '../types';

export function removeNode(node: VNode | VNode[]): void {
  if (node instanceof Array) {
    node.map(removeNode);
    return;
  }

  if (!(node && node.target && node.target.parentNode)) return;

  node.target.parentNode.removeChild(node.target);

  if (node.scope) {
    node.scope.destroy();
  }
}
