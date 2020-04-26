export async function asyncMap<T>(value: T[], fn): Promise<T[]> {
  const output: T[] = [];

  for (const i in value) {
    output.push(await fn(value[i], parseInt(i, 10)));
  }

  return output;
}
