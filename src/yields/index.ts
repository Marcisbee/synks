import { VNode, Scope, NodeContext, GeneratorRenderer, ContextFunction } from "../../types";
import { isHook, handleHooks } from "./hook";
import { isContext, handleContext } from "./context";

export async function handleCustomYields(
  generator: GeneratorRenderer,
  output: VNode | VNode[] | ContextFunction | GeneratorFunction,
  scope: Scope,
  node: VNode,
  context: NodeContext
): Promise<VNode | VNode[]> {
  output = (await generator.next()).value;

  while (isHook(output) || isContext(output)) {
    output = await handleHooks(generator, scope, context, node, output);
    output = await handleContext(generator, scope, context, node, output);
  }

  return output as VNode;
}
