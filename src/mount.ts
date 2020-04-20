import { patch } from './patch';

/**
 * 0 = append
 * 1 = after
 * 2 = replace
 */
export async function mount(node, container = document.body) {
  let output;

  try {
    output = await patch(node, container, 0, {});
  } catch (e) {
    console.error("[Sourc]", e);
  }

  return output;
}
