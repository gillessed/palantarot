

export function interpolateValue(x1: number, x2: number, t: number) {
  return x1 + (x2 - x1) * t;
}
