import { interpolateValue } from "../utils/interpolateValue";

type Color = [number, number, number];
const C_Black: Color = [0, 0, 0];
const C_White: Color = [256, 256, 256];
export function interpolateColor(
  [r1, g1, b1]: Color,
  [r2, g2, b2]: Color,
  t: number
): Color {
  return [
    interpolateValue(r1, r2, t),
    interpolateValue(g1, g2, t),
    interpolateValue(b1, b2, t),
  ];
}

export function interpolateColorString(c1: string, c2: string, t: number) {
  return toColorString(
    interpolateColor(parseColorString(c1), parseColorString(c2), t)
  );
}

const T_List = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function parseColorString(str: string): Color {
  const r = parseInt(str.slice(1, 3), 16);
  const g = parseInt(str.slice(3, 5), 16);
  const b = parseInt(str.slice(5, 7), 16);
  return [r, g, b];
}

const zeroPad = (s: string, n: number) => {
  let r = s;
  while (r.length < n) {
    r = "0" + r;
  }
  return r;
};

const b16 = (n: number) => zeroPad(Math.round(n).toString(16), 2);

function toColorString([r, g, b]: Color): string {
  return `#${b16(r)}${b16(g)}${b16(b)}`;
}

function createColorTheme(colorString: string): string[] {
  const c = parseColorString(colorString);
  const shades = T_List.map((t) => interpolateColor(C_Black, c, t));
  const tints = T_List.map((t) => interpolateColor(c, C_White, t));
  return [...shades, c, ...tints].map((color) => toColorString(color));
}

export const Green = createColorTheme("#22AA22");
export const Blue = createColorTheme("#2266AA");
export const Yellow = createColorTheme("#E4D00A");
export const Gray = createColorTheme("#777777");
export const Red = createColorTheme("#AA2222");
