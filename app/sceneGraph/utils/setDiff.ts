export function setDiff<T>(i1: Iterable<T>, i2: Iterable<T>) {
  const s1 = new Set(i1);
  const s2 = new Set(i2);

  const removed: T[] = [];
  const added: T[] = [];
  for (const item of i1) {
    if (!s2.has(item)) {
      removed.push(item);
    }
  }
  for (const item of i2) {
    if (!s1.has(item)) {
      added.push(item);
    }
  }
  return { removed, added };
}
