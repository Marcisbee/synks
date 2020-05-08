import { VNode, VNodeProps } from '../types';

export function transformNode(node?: VNode | string | null | undefined | number): VNode {
  if (node && node instanceof Object) {
    if (node.children instanceof Array) {
      node.children = node.children.map(transformNode);
    }

    return Object.assign(node, {
      type: node.type,
      props: node.props,
      key: node.key,
      children: node.children,
      target: null,
      instance: null,
      scope: null,
    });
  }

  return {
    type: '',
    props: node as unknown as VNodeProps,
    key: null,
    children: undefined,
  };
}
