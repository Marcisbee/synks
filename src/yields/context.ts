import { Scope, NodeContext, VNode } from "../../types";
import { Context } from "../Context";

export function isContext(value: any): boolean {
  return value && Object.getPrototypeOf(value) === Context;
}

export async function handleContext(
  generator: any,
  scope: Scope,
  context: NodeContext,
  node: VNode | VNode[],
  contextRoot: any
): Promise<any> {
  if (!isContext(contextRoot)) return contextRoot;

  const contextName = contextRoot && (contextRoot as unknown as Function).name;
  const currentContext = context[contextName];

  if (!currentContext) {
    throw new Error(`${contextName} was called in <${((node as VNode).type as Function).name}> before it was defined`);
  }

  if (currentContext[1].indexOf(scope) === -1) {
    currentContext[1].push(scope);
  }

  return (await generator.next(currentContext[0])).value;
}
