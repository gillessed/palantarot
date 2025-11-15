export type Vector = [number, number]

export function v_new(x: number = 0, y: number = 0): Vector {
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

export function v_scalar(v: Vector, scalar: number) {
  v[0] *= scalar;
  v[1] *= scalar;
}