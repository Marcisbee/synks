import { VNode, VNodeProps } from '../types';

export function h(type: string | Function, props: VNodeProps, ...children: VNode[]): VNode {
  const key = props && props.key

  return {
    type,
    props,
    children,
    key: key === undefined ? null : key,
  };
}
