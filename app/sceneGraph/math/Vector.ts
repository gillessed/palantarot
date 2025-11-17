export type Vector = [number, number];

export function v_new(x: number = 0, y: number = 0): Vector {
  return [x, y];
}
export function v_copy([x, y]: Vector): Vector {
  return [x, y];
}
export function v_set(v: Vector, x: number, y: number): void;
export function v_set(v: Vector, other: Vector, fake?: number): void;
export function v_set(v: Vector, a1: number | Vector, a2?: number | never) {
  if (Array.isArray(a1)) {
    v[0] = a1[0];
    v[1] = a1[1];
  } else if (typeof a1 === "number" && a2 != null && typeof a2 === "number") {
    v[0] = a1;
    v[1] = a2;
  } else {
    throw Error("Incorrect args for set");
  }
}

export function v_sum(v1: Vector, [x, y]: Vector) {
  v1[0] += x;
  v1[1] += y;
}

export function v_sub(v1: Vector, [x, y]: Vector) {
  v1[0] -= x;
  v1[1] -= y;
}

export function v_scalar(v: Vector, scalar: number) {
  v[0] *= scalar;
  v[1] *= scalar;
}

export function v_mult(v: Vector, [x, y]: Vector) {
  v[0] *= x;
  v[1] *= y;
}

export function v_div(v: Vector, [x, y]: Vector) {
  v[0] /= x;
  v[1] /= y;
}

export function v_rotate(v: Vector, theta: number) {
  const [x, y] = v;
  v[0] = x * Math.cos(theta) - y * Math.sin(theta);
  v[1] = x * Math.sin(theta) + y * Math.cos(theta);
}

export function v_is_zero([x, y]: Vector) {
  return x === 0 && y === 0;
}

export function v_is_one([x, y]: Vector) {
  return x === 1 && y === 1;
}
