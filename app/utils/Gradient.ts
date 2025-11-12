export type Color = { r: number; g: number; b: number };
export type GradientStop = [number, Color];
export type Gradient = GradientStop[];

function interpolate(x: number, y: number, t: number) {
  return (t - x) / (y - x);
}

export function getGradientColor(value: number, gradient: Gradient): Color {
  if (gradient.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  if (gradient.length === 1) {
    return gradient[0][1];
  }
  let stopIndex = 0;
  while (stopIndex < gradient.length) {
    if (stopIndex === gradient.length - 1) {
      return gradient[stopIndex][1];
    }
    if (value < gradient[stopIndex + 1][0]) {
      break;
    }
    stopIndex++;
  }
  const x = gradient[stopIndex][0];
  const { r: r1, g: g1, b: b1 } = gradient[stopIndex][1];
  const y = gradient[stopIndex + 1][0];
  const { r: r2, g: g2, b: b2 } = gradient[stopIndex + 1][1];
  return {
    r: r1 + (r2 - r1) * interpolate(x, y, value),
    g: g1 + (g2 - g1) * interpolate(x, y, value),
    b: b1 + (b2 - b1) * interpolate(x, y, value),
  };
}
