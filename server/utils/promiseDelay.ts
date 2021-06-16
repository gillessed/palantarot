export function promiseDelay(milli: number) {
  return new Promise((resolve: () => void) => {
    setTimeout(() => resolve(), milli);
  });
}
