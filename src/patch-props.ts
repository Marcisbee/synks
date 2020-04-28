import { VNode } from '../types';

export function patchProps(currentNode: VNode, previousNode: VNode): void {
  const target = currentNode.target;
  if (!currentNode.type || (target instanceof Text)) return;

  Object.keys(currentNode.props || {}).forEach(name => {
    const value = currentNode.props[name];
    const oldValue = previousNode.props && previousNode.props[name];
    if (value === oldValue) return;
    if (value instanceof Function) {
      if (value === target[name]) return;
      return (target[name] = value);
    } else {
      if (value === null || value === false || value === undefined) {
        return target.removeAttribute(name);
      }
      return target.setAttribute(name, String(value));
    }
  });

  if (!previousNode) return;

  Object.keys(previousNode.props || {}).forEach(name => {
    if (currentNode.props && (
      currentNode.props[name] !== null
      && currentNode.props[name] !== false
      && currentNode.props[name] !== undefined
    )) return;

    return target.removeAttribute(name);
  });
}
