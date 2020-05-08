import { ContextFunction, GeneratorRenderer, Hook, NodeContext, Scope, VNode } from "../../types";
import { handleContext } from "./handle-context";
import { handleHooks } from "./handle-hook";
import { isContext } from "../utils/is-context";
import { isGenerator } from "../utils/is-generator";

export async function handleCustomYields(
  generator: GeneratorRenderer,
  output: VNode | VNode[] | ContextFunction | GeneratorFunction,
  scope: Scope,
  node: VNode,
  context: NodeContext
): Promise<VNode | VNode[]> {
  output = (await generator.next()).value;

  while (isGenerator<Hook>(output) || isContext(output)) {
    output = await handleHooks(generator, scope, context, node, output);
    output = await handleContext(generator, scope, context, node, output);
  }

  return output as VNode;
}
