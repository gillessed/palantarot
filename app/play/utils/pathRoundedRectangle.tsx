export function pathRoundedRectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  round?: [boolean, boolean, boolean, boolean]
) {
  const [r1, r2, r3, r4] = round ?? [true, true, true, true];
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  if (r1) {
    ctx.arcTo(x + w, y, x + w, y + r, r);
  } else {
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + r);
  }
  ctx.lineTo(x + w, y + h - r);
  if (r2) {
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  } else {
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - r, y + h);
  }
  ctx.lineTo(x + r, y + h);
  if (r3) {
    ctx.arcTo(x, y + h, x, y + h - r, r);
  } else {
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - r);
  }
  ctx.lineTo(x, y + r);
  if (r4) {
    ctx.arcTo(x, y, x + r, y, r);
  } else {
    ctx.lineTo(x, y);
    ctx.lineTo(x + r, y);
  }
}
