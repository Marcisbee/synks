import { Scope, NodeContext, VNode, GeneratorRenderer, ContextFunction } from "../../types";
import { Context } from "../Context";

export function isContext(value: any): value is ContextFunction {
  return value && Object.getPrototypeOf(value) === Context;
}

export async function handleContext(
  generator: GeneratorRenderer,
  scope: Scope,
  context: NodeContext,
  node: VNode | VNode[],
  contextRoot: any
): Promise<any> {
  if (!isContext(contextRoot)) return contextRoot;

  const contextName = contextRoot && contextRoot.name;
  const currentContext = context[contextName];

  if (!currentContext) {
    throw new Error(`${contextName} was called in <${((node as VNode).type as Function).name}> before it was defined`);
  }

  if (currentContext[1].indexOf(scope) === -1) {
    currentContext[1].push(scope);
  }

  return (await generator.next(currentContext[0])).value;
}
