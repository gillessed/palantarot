import type { Card } from "../../server/play/model/Card.ts";

export function isCardEqual(c1: Card | undefined, c2: Card | undefined) {
  if (c1 == null || c2 == null) {
    return false;
  }
  const [s1, v1] = c1;
  const [s2, v2] = c2;
  return s1 === s2 && v1 === v2;
}
