export function promiseDelay(milli: number) {
  return new Promise((resolve: (value: void) => void) => {
    setTimeout(() => resolve(), milli);
  });
}
