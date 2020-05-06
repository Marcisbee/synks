import { VNode } from '../types';

enum PROPS {
  innerHTML = 'innerHTML',
  style = 'style',
}

function patchStyle(currentNode: VNode, previousNode: VNode): void {
  const target = currentNode.target;
  if (!currentNode.type || (target instanceof Text) || !target) return;

  const styleA = (currentNode.props || {}).style || {};
  const styleB = (previousNode.props || {}).style || {};

  Object.keys(styleA).forEach(name => {
    const value = styleA[name];
    const oldValue = styleB[name];
    if (value === oldValue) return;
    if (value === null || value === false || value === undefined) {
      return delete target[name];
    }

    return target.style[name] = String(value);
  });

  if (!previousNode) return;

  Object.keys(styleB).forEach(name => {
    if (styleA && (
      styleA[name] !== null
      && styleA[name] !== false
      && styleA[name] !== undefined
    )) return;

    return delete target.style[name];
  });
}

export function patchProps(currentNode: VNode, previousNode: VNode): void {
  const target = currentNode.target;
  if (!currentNode.type || (target instanceof Text) || !target) return;

  const propsA = currentNode.props || {};
  const propsB = previousNode.props || {};

  Object.keys(propsA).forEach(name => {
    if (name === PROPS.style) return;

    const value = propsA[name];
    const oldValue = propsB[name];
    if (value === oldValue) return;
    if (value instanceof Function) {
      if (value === target[name]) return;
      return (target[name] = value);
    } else {
      if (value === null || value === false || value === undefined) {
        return target.removeAttribute(name);
      }

      const newValue = String(value);

      if (name === PROPS.innerHTML) {
        return target[name] = newValue;
      }

      return target.setAttribute(name, newValue);
    }
  });

  if (!previousNode) return;

  Object.keys(propsB).forEach(name => {
    if (name === PROPS.style) return;

    if (propsA && (
      propsA[name] !== null
      && propsA[name] !== false
      && propsA[name] !== undefined
    )) return;

    if (name === PROPS.innerHTML) {
      return delete target[name];
    }

    return target.removeAttribute(name);
  });

  patchStyle(currentNode, previousNode);
}
