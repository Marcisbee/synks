import { VNode, Scope, NodeContext } from "../../types";
import { Context } from "../Context";
import { isHook, handleHooks } from "./hook";
import { isContext, handleContext } from "./context";

export async function handleCustomYields(
  generator: any,
  output: VNode | VNode[] | Context | GeneratorFunction,
  scope: Scope,
  node: VNode,
  context: NodeContext
): Promise<VNode | VNode[]> {
  output = (await generator.next()).value;

  while (isHook(output) || isContext(output)) {
    output = await handleHooks(generator, scope, context, node, output);
    output = await handleContext(generator, scope, context, node, output);
  }

  return output as unknown as VNode;
}
