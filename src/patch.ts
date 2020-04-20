import { render, CustomNode } from './render';
import variables from './variables';
import { Context } from './Context';

export async function patch(node, container, actionType = 0, context): Promise<CustomNode | CustomNode[]> {
  if (node === undefined) {
    return;
  }

  const historyInstance = container.history && container.history.type instanceof Function && container.history.instance;
  const history = historyInstance
    ? { ...historyInstance, target: container.history.target }
    : container.history;
  const shouldPatch = !!history;

  if (Array.isArray(node)) {
    const output = [];

    for (const child of node) {
      output.push(await patch(child, container, actionType, context));
    }

    return output;
  }

  if (!actionType) {
    variables.parent = container;
  }

  if (actionType && shouldPatch && node) {
    if (node.type === history.type && history.target) {
      if (node.props !== history.props) {
        Object.keys(node.props || {}).forEach(key => {
          const lowerKey = key.toLowerCase();
          const value = node.props[key];
          if (value !== (history.props && history.props[key])) {
            history.target.setAttribute(lowerKey, value);
            history.target[lowerKey] = value;

            if (value === false) {
              history.target.removeAttribute(lowerKey);
            }
          }
        });
      }

      for (const index in node.children) {
        const child = node.children[index];
        const childNode = history.target.childNodes[index];
        if (childNode !== undefined) {
          await patch(child, childNode, 2, context);
        } else {
          await patch(child, history.target, 0, context);
        }
      }

      Array.prototype.slice.call(history.target.childNodes || []).map((childNode, index) => {
        if (node.children[index] === undefined) {
          history.target.removeChild(childNode);
        }
      });

      history.target.history = {
        ...node,
        target: history.target
      };

      return history.target;
    }

    if (node === history) {
      return;
    }
  }

  if (actionType === 2 && node.type === undefined && container.nodeType === 3) {
    container.nodeValue = node;
    return container;
  }

  const element = node instanceof Node ? node : await render(node, context);

  if (node.type instanceof Context) {
    return element;
  }

  if (node instanceof Object) {
    if (Array.isArray(element)) {
      element.forEach((el, index) => {
        el.history = {
          ...node.children[index].instance,
          target: element,
        };
      });
    } else {
      (element as any).history = node;
    }
    node.target = element;
  }

  if (node.type instanceof Function && actionType === 2) {
    return;
  }

  if (actionType === 2) {
    if (!container.parentNode) {
      return element;
    }

    container.parentNode.replaceChild(element, container);
    return element;
  }

  if (actionType === 1) {
    container.parentNode.insertBefore(element, container.nextSibling);
    return element;
  }

  if (Array.isArray(element)) {
    return element.map(item => (
      patch(item, container, actionType, context)
    ) as any);
  }

  container.appendChild(element);

  return element;
}
