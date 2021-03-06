import { GeneratorRenderer, Hook, NodeContext, Scope, VNode } from "../../types";
import { isContext } from "../utils/is-context";
import { isGenerator } from "../utils/is-generator";
import { SCOPE } from "../symbols";

export async function handleHooks(
  generator: GeneratorRenderer,
  scope: Scope,
  context: NodeContext,
  node: VNode | VNode[],
  hook: any
): Promise<any> {
  if (!isGenerator<Hook>(hook)) return hook;

  let value = await hook.next();

  while (isContext(value.value) || value.value === SCOPE) {
    // Allows context in hooks
    if (isContext(value.value)) {
      const contextName = value.value && value.value.name;
      const currentContext = context[contextName];

      if (!currentContext) {
        throw new Error(`${contextName} was called from hook in <${((node as VNode).type as Function).name}> before it was defined`);
      }

      if (currentContext[1].indexOf(scope) === -1) {
        currentContext[1].push(scope);
      }

      value = await hook.next(currentContext[0]);
    }

    // Returns current component scope in hook
    if (value.value === SCOPE) {
      value = await hook.next(
        {
          ...scope,
          async next() {
            if (value !== undefined) {
              Object.assign(value, await hook.next());
            }

            return await scope.next();
          },
        }
      );
    }
  }

  return (await generator.next(value)).value;
}
