export function assertNever(value: never) {
  throw new Error("Unexpected value: " + value);
}