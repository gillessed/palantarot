export type Matrix = [[number, number], [number, number]];

export const M_Identity: Matrix = m_new();

export function m_new(): Matrix {
  return [
    [1, 0],
    [0, 1],
  ]
}

export function m_set(m: Matrix, [[n11, n12], [n21, n22]]: Matrix) {
  m[0][0] = n11;
  m[0][1] = n12;
  m[1][0] = n21;
  m[1][1] = n22;
}

export function m_add(m: Matrix, [[n11, n12], [n21, n22]]: Matrix) {
  const [[m11, m12], [m21, m22]] = m;
  m[0][0] = m11 + n11;
  m[0][1] = m12 + n12;
  m[1][0] = m21 + n21;
  m[1][1] = m22 + n22
}

export function m_mult(m: Matrix, [[n11, n12], [n21, n22]]: Matrix) {
  const [[m11, m12], [m21, m22]] = m;
  m[0][0] = m11 * n11 + m21 * n12;
  m[0][1] = m12 * n11 + m22 * n12;
  m[1][0] = m11 * n21 + m21 * n22;
  m[1][1] = m12 * n21 + m22 * n22;
}