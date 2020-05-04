function checkEquality(a: Record<string, unknown>, b: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    if (typeof a[key] === 'function' && String(a[key]) !== String(b[key])) {
      return false;
    }

    if (JSON.stringify(a[key]) !== JSON.stringify(b[key]) && a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export function quickEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a === b) return true;
  if (!(a instanceof Object && a)) return false;
  if (!(b instanceof Object && b)) return false;

  const ai = Object.keys(a);
  const bi = Object.keys(b);

  if (ai.length !== bi.length) return false;

  return checkEquality(a, b, ai);
}
