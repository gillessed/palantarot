export function setsEqual<T>(setOne: Set<T>, setTwo: Set<T>): boolean {
  for (const card of setOne) {
    if (!setTwo.has(card)) {
      return false;
    }
  }
  for (const card of setTwo) {
    if (!setOne.has(card)) {
      return false;
    }
  }
  return true;
}