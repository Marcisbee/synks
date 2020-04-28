import { VNode } from '../types';

import { removeNode } from './remove-node';

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
