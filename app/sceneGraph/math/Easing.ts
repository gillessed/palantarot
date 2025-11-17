export type EasingFunction = "inOutSine" | "inOutCubic";

export const EasingFunctions: {
  [key in EasingFunction]: (value: number) => number;
} = {
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  inOutCubic: (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
};
