import { VNode, VNodeProps, VNodeType } from '../types';

export function h(type: VNodeType, props: VNodeProps, ...children: VNode[]): VNode {
  const key = props && props.key

  return {
    type,
    props,
    children,
    key: key === undefined ? null : key,
  };
}
