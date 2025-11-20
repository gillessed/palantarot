export type EasingFunction =
  | "inOutSine"
  | "inOutCubic"
  | "outCubic"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeOutBounce";

export const EasingFunctions: {
  [key in EasingFunction]: (value: number) => number;
} = {
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  inOutCubic: (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outCubic: (x: number) => {
    return 1 - Math.pow(1 - x, 3);
  },
  easeInElastic: (x: number) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
  },
  easeOutElastic: (x: number) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (x: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  },
};
