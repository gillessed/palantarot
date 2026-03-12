import { Vector } from "../../sceneGraph/math/Vector";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";

export function transformVector(vector: Vector, source: TwoDNode, target: TwoDNode) {
  const worldPosition = source.transformFromNodeSpace(vector);
  return target.transformToNodeSpace(worldPosition);
}