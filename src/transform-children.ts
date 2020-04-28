import { VNode } from '../types';

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
