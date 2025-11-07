export function filterFalsy<T>(list: Array<T | undefined>): T[] {
  const newList: T[] = [];
  for (const item of list) {
    if (item != null) {
      newList.push(item);
    }
  }
  return newList;
}
