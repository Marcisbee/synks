export function transformChildren(children: (VNode | string)[]): VNode[] {
  return children.map((child) => {
    if (child instanceof Array) {
      return transformChildren(child);
    }

    if (child instanceof Object) {
      return child;
    }

    return {
      type: '',
      props: child,
      key: null,
    };
  }) as VNode[];
}
