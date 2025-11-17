import { v_set, type Vector } from "../../sceneGraph/math/Vector";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { PlaySceneContext } from "../PlaySceneContext";
import { PlayerLayoutNode, type PlayerPosition } from "./PlayerLayoutNode";

const TopOffsetFactor = 1 / 2;
const BottomHandPadding = 200;
const PositionMap: {
  [key in PlayerPosition]: (halfWidth: number, halfHeight: number) => Vector;
} = {
  left: (halfWidth: number, _: number) => [-halfWidth, 0],
  "top-left": (halfWidth: number, halfHeight: number) => [
    -halfWidth * TopOffsetFactor,
    -halfHeight,
  ],
  top: (_: number, halfHeight: number) => [0, -halfHeight],
  "top-right": (halfWidth: number, halfHeight: number) => [
    halfWidth * TopOffsetFactor,
    -halfHeight,
  ],
  right: (halfWidth: number, _: number) => [halfWidth, 0],
  bottom: (halfWidth: number, halfHeight: number) => [
    halfWidth - BottomHandPadding,
    halfHeight,
  ],
};

export class PlayerNode extends TwoDNode<PlaySceneContext> {
  public playerLayoutNode: PlayerLayoutNode;

  constructor(id: string) {
    super(id);

    this.playerLayoutNode = new PlayerLayoutNode(`${id}-layout`);
    this.addChild(this.playerLayoutNode);
  }

  public setPlayerPosition = (playerPosition: PlayerPosition) =>
    this.playerLayoutNode.setPlayerPosition(playerPosition);

  public update = () => {
    const halfWidth = (this.container?.width ?? 0) / 2;
    const halfHeight = (this.container?.height ?? 0) / 2;
    v_set(
      this.offset,
      PositionMap[this.playerLayoutNode.playerPosition](halfWidth, halfHeight)
    );
  };
}
