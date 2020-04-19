import { setProps } from './set-props';
import { patch } from './patch';
import { Context } from './Context';
import variables from './variables';

export async function render(node, context = {}) {
  if (Array.isArray(node)) {
    let output = [];

    for (let child of node) {
      output.push(await render(child, context));
    }

    return output;
  }

  if (node === undefined) {
    return document.createComment("");
  }

  if (node instanceof Promise) {
    const placeholder = document.createComment("");
    const output = await node;

    patch(output, placeholder, 1, context);

    return placeholder;
  }

  if (node.type instanceof Function) {
    const isContext = Object.getPrototypeOf(node.type) === Context;
    let currentNode;
    let asyncIterator;
    let output;

    if (isContext) {
      const currentContext = new node.type(node.props);
      const name = node.type.name;
      const events = [];

      const nextFn = (newContext) => {
        Object.assign(currentContext, newContext);
        events.forEach((fn) => fn());
      };
      currentContext.__update = () => nextFn.call(currentContext);
      const ctx = [currentContext, nextFn];

      return currentNode = await render(node.children, {
        ...context,
        [name]: [ctx, events],
      });
    }

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
            2,
            context
          ));
        }

        if (!currentNode) {
          throw new Error("`this.next` can not be called initially");
        }

        const next = await output.next();
        return (currentNode = await patch(next.value, currentNode, 2, context));
      },
      async *[(Symbol as any).asyncIterator]() {
        asyncIterator = true;
        yield {
          ...node.props,
          children: node.children
        };
      }
    };

    output = node.type.call(scope, {
      ...node.props,
      children: node.children
    });

    if (output.next && output.throw && output.return) {
      let next = await output.next();
      let outputIsContext = Object.getPrototypeOf(next.value) === Context;

      if (outputIsContext) {
        do {
          const contextName = next.value && next.value.name;
          const currentContext = context[contextName];

          if (!currentContext) {
            throw new Error(`${contextName} was called in <${node.type.name}> before it was defined`);
          }

          currentContext[1].push(scope.next);

          next = await output.next(currentContext[0]);

          outputIsContext = Object.getPrototypeOf(next.value) === Context;
        } while (outputIsContext);
      }

      // if (outputIsContext) {
      //   const contextName = next.value && next.value.name;
      //   const currentContext = context[contextName];

      //   if (!currentContext) {
      //     throw new Error(`${contextName} was called in <${node.type.name}> before it was defined`);
      //   }

      //   currentContext[1].push(scope.next);

      //   next = await output.next(currentContext[0]);
      // }

      node.instance = next.value;

      currentNode = await render(next.value, context);

      if (asyncIterator) {
        scope.next();
      }

      return currentNode;
    }

    node.instance = output;

    return (currentNode = await render(output, context));
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

    await patch(node.children, element, 0, context);

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
