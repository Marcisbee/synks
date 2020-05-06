import { Scope, NodeContext, VNode } from "../../types";
import { isContext } from "./context";

export const SCOPE = Symbol("SCOPE");

export function isHook(value: any): boolean {
  return value && value.next instanceof Function && value.throw instanceof Function;
}

export async function handleHooks(
  generator: any,
  scope: Scope,
  context: NodeContext,
  node: VNode | VNode[],
  hook: any
): Promise<any> {
  if (!isHook(hook)) return hook;

  let value = await hook.next();

  while (isContext(value.value) || value.value === SCOPE) {
    // Allows context in hooks
    if (isContext(value.value)) {
      const contextName = value.value && (value.value as unknown as Function).name;
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
