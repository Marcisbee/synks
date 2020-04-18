import { patch } from './patch';

/**
 * 0 = append
 * 1 = after
 * 2 = replace
 */
export async function mount(node, container = document.body) {
  let output;

  try {
    output = await patch(node, container);
  } catch (e) {
    console.error("[Radi] Uncaught error:", e);
  }

  return output;
}
