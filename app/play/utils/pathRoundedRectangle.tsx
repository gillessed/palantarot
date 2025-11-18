export function pathRoundedRectangle(
  path: Path2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  round?: [boolean, boolean, boolean, boolean]
) {
  const [r1, r2, r3, r4] = round ?? [true, true, true, true];
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  if (r1) {
    path.arcTo(x + w, y, x + w, y + r, r);
  } else {
    path.lineTo(x + w, y);
    path.lineTo(x + w, y + r);
  }
  path.lineTo(x + w, y + h - r);
  if (r2) {
    path.arcTo(x + w, y + h, x + w - r, y + h, r);
  } else {
    path.lineTo(x + w, y + h);
    path.lineTo(x + w - r, y + h);
  }
  path.lineTo(x + r, y + h);
  if (r3) {
    path.arcTo(x, y + h, x, y + h - r, r);
  } else {
    path.lineTo(x, y + h);
    path.lineTo(x, y + h - r);
  }
  path.lineTo(x, y + r);
  if (r4) {
    path.arcTo(x, y, x + r, y, r);
  } else {
    path.lineTo(x, y);
    path.lineTo(x + r, y);
  }
}
