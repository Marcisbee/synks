import { GeneratorRenderer, NodeContext, Scope, VNode } from "../../types";
import { isContext } from "../utils/is-context";

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
