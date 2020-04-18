import { setProps } from './set-props';
import { patch } from './patch';
import variables from './variables';

export async function render(node) {
  if (Array.isArray(node)) {
    let output = [];

    for (let child of node) {
      output.push(await render(child));
    }

    return output;
  }

  if (node === undefined) {
    return document.createComment("");
  }

  if (node instanceof Promise) {
    const placeholder = document.createComment("");
    const output = await node;

    patch(output, placeholder, 1);

    return placeholder;
  }

  if (node.type instanceof Function) {
    let currentNode;
    let asyncIterator;

    const scope = {
      async next() {
        if (output && !output.next) {
          output = node.type.call(scope, {
            ...node.props,
            children: node.children
          });

          return (currentNode = await patch(
            output,
            currentNode,
            2
          ));
        }

        if (!currentNode) {
          throw new Error("[Radi] `this.next` can not be called initially");
        }

        const next = await output.next();
        return (currentNode = await patch(next.value, currentNode, 2));
      },
      async *[(Symbol as any).asyncIterator]() {
        asyncIterator = true;
        yield {
          ...node.props,
          children: node.children
        };
      }
    };

    let output = node.type.call(scope, {
      ...node.props,
      children: node.children
    });

    if (output.next && output.throw && output.return) {
      const next = await output.next();

      node.instance = next.value;

      currentNode = await render(next.value);

      if (asyncIterator) {
        scope.next();
      }

      return currentNode;
    }

    node.instance = output;

    return (currentNode = await render(output));
  }

  if (typeof node.type === "string") {
    let element;
    if (node.type === "svg" || variables.parent instanceof SVGElement) {
      element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        node.type
      );
    } else {
      element = document.createElement(node.type);
    }

    // set attributes
    setProps(element, node.props);

    await patch(node.children, element);

    return element;
  }

  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

  if (!node) {
    return;
  }

  return (document.createTextNode(node.toString()));
}
