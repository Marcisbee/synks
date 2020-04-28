import { VNode, VNodeProps } from '../types';

import { transformChildren } from './transform-children';

export function h(type: string | Function, props: VNodeProps, ...rawChildren: (VNode | string)[]): VNode {
  const children = rawChildren.length > 0 ? transformChildren(rawChildren) : [];
  const key = props && props.key

  return {
    type,
    props,
    children,
    key: key === undefined ? null : key,
  };
}
