
export function quickEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  if (a === b) return true;
  if (!(a instanceof Object && a)) return false;
  if (!(b instanceof Object && b)) return false;

  const ai = Object.keys(a);
  const bi = Object.keys(b);

  if (ai.length !== bi.length) return false;

  return JSON.stringify(a, ai) === JSON.stringify(b, ai);
}
