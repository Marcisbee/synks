export function h(type, props, ...children) {
  return {
    type,
    props,
    children: [].concat(...children),
    key: props && props.key
  };
}
