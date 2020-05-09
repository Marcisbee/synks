import { VNode, VNodeProps } from '../types';

function isVnode(value: any): value is VNode {
  return value && value instanceof Object;
}

export function transformNode<T = VNode | VNode[]>(node?: T | string | null | number): T {
  if (node instanceof Array) {
    return Object.assign(node, node.map(transformNode) as any);
  }

  if (isVnode(node)) {
    if (node.children instanceof Array) {
      node.children = node.children.map(transformNode);
    }

    return Object.assign(node, {
      type: node.type,
      props: node.props,
      key: node.key === undefined ? null : node.key,
      children: node.children,
      target: null,
      instance: null,
      scope: null,
    }) as T;
  }

  return {
    type: '',
    props: node as unknown as VNodeProps,
    key: null,
    children: undefined,
  } as unknown as T;
}
