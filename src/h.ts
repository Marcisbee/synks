import { transformChildren } from './transform-children';

export function h(type: string | Function, props: null | Record<string, any>, ...rawChildren: (VNode | string)[]): VNode {
  const children = transformChildren(rawChildren);

  return {
    type,
    props,
    children,
    key: props && props.key
  };
}
