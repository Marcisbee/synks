import { VNode, VNodeProps } from '../types';

import { transformChildren } from './transform-children';

export function h(type: string | Function, props: VNodeProps, ...rawChildren: (VNode | string)[]): VNode {
  const children = transformChildren(rawChildren);

  return {
    type,
    props,
    children,
    key: props && props.key
  };
}
