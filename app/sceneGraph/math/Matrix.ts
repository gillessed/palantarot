import type { Vector } from "./Vector";

export type Matrix = [[number, number, number], [number, number, number]];

export const M_Identity: Matrix = m_new();

export function m_new(): Matrix {
  return [
    [1, 0, 0],
    [0, 1, 0],
  ];
}

export function m_copy(m: Matrix): Matrix {
  return [[...m[0]], [...m[1]]];
}

export function m_set(m: Matrix, [[n11, n12, n13], [n21, n22, n23]]: Matrix) {
  m[0][0] = n11;
  m[0][1] = n12;
  m[0][2] = n13;
  m[1][0] = n21;
  m[1][1] = n22;
  m[1][2] = n23;
}

export function m_add(m: Matrix, [[n11, n12, n13], [n21, n22, n23]]: Matrix) {
  const [[m11, m12, m13], [m21, m22, m23]] = m;
  m[0][0] = m11 + n11;
  m[0][1] = m12 + n12;
  m[0][2] = m13 + n13;
  m[1][0] = m21 + n21;
  m[1][1] = m22 + n22;
  m[1][2] = m23 + n23;
}

export function m_mult(m: Matrix, [[n11, n12, n13], [n21, n22, n23]]: Matrix) {
  const [[m11, m12, m13], [m21, m22, m23]] = m;
  m[0][0] = m11 * n11 + m21 * n12;
  m[0][1] = m12 * n11 + m22 * n12;
  m[0][2] = m13 * n11 + m23 * n12 + n13;
  m[1][0] = m11 * n21 + m21 * n22;
  m[1][1] = m12 * n21 + m22 * n22;
  m[1][2] = m12 * n21 + m23 * n22 + n23;
}

export function m_mult_v(
  [[m11, m12, m13], [m21, m22, m23]]: Matrix,
  v: Vector
) {
  const [x, y] = v;
  v[0] = x * m11 + y * m12 + m13;
  v[1] = y * m21 + y * m22 + m23;
}

export function m_invert(m: Matrix) {
  const [[a, b, u], [c, d, v]] = m;
  const discr = a * d - b * c;
  m[0][0] = d / discr;
  m[0][1] = -b / discr;
  m[0][2] = -(d * u - b * v) / discr;
  m[1][0] = -c / discr;
  m[1][1] = a / discr;
  m[1][2] = -(a * v - c * u) / discr;
}

export function m_rotation(theta: number): Matrix {
  return [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
  ];
}

export function m_diagonal(n11: number, n22: number): Matrix {
  return [
    [n11, 0, 0],
    [0, n22, 0],
  ];
}

export function m_translate(x: number, y: number): Matrix {
  return [
    [1, 0, x],
    [0, 1, y],
  ];
}

export function transformContext(
  ctx: CanvasRenderingContext2D,
  [[m11, m12, m13], [m21, m22, m23]]: Matrix
) {
  ctx.transform(m11, m12, m21, m22, m13, m23);
}

export function copyAndPrintMatrix(m: Matrix) {
  const copy = m_copy(m);
  console.log(copy);
}
