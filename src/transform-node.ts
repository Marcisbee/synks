import { VNode, VNodeProps } from '../types';

export function transformNode(node: VNode | string | null | undefined | number): VNode {
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
    });
  }

  return {
    type: '',
    props: node as unknown as VNodeProps,
    key: null,
    children: undefined,
  };
}

export function transformChildren(children: (VNode | string)[]): VNode[] {
  return children.map((child) => {
    if (child instanceof Array) {
      return transformChildren(child);
    }

    if (child instanceof Object) {
      return {
        type: child.type,
        props: child.props,
        key: child.key,
        children: child.children,
      };
    }

    return {
      type: '',
      props: child,
      key: null,
    };
  }) as VNode[];
}
