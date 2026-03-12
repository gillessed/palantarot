import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";

/**
 * Moves a node from its existing parent to a new parent, ensuring that the nodes offset
 * is remapped to ensure the same world space coordinates under the new parent.
 */
export function transferNode(node: TwoDNode, newParent: TwoDNode, index?: number) {
  if (node.parent != null) {
    const worldCoordinates = node.transformFromNodeSpace(node.position);
    const newParentCoordinates = newParent.transformToNodeSpace(worldCoordinates);
    node.offset = newParentCoordinates;
    node.removeSelf();
  }
  if (index == null) {
    newParent.addChild(node);
  } else {
    newParent.insertChild(node, index);
  }
}