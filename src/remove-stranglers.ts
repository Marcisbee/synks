import { removeNode } from './remove-node';
import { VNode } from '../types';

export function removeStranglers(previous: VNode | VNode[]): void {
  if (previous instanceof Array) {
    previous.forEach((prev) => {
      const instance = (prev.instance || prev) as VNode;
      if (instance.target !== null) {
        removeNode(prev);
      }
    });
  }
}
