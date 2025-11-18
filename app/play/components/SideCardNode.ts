import { v_set, type Vector } from "../../sceneGraph/math/Vector";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import { CardHeight, CardWidth } from "../constants/CardConstants";
import type { PlaySceneContext } from "../PlaySceneContext";
import { LoadedImageNode } from "./LoadedImageNode";

const TopOffsetFactor = 1 / 2;
const BottomHandPadding = 200;
const PositionMap: {
  [key in SideCardPosition]: (
    halfWidth: number,
    halfHeight: number
  ) => [Vector, Axis];
} = {
  left: (halfWidth: number, _: number) => [[-halfWidth, 0], "x"],
  "top-left": (halfWidth: number, halfHeight: number) => [
    [-halfWidth * TopOffsetFactor, -halfHeight],
    "y",
  ],
  top: (_: number, halfHeight: number) => [[0, -halfHeight], "y"],
  "top-right": (halfWidth: number, halfHeight: number) => [
    [halfWidth * TopOffsetFactor, -halfHeight],
    "y",
  ],
  right: (halfWidth: number, _: number) => [[halfWidth, 0], "x"],
  bottom: (halfWidth: number, halfHeight: number) => [
    [halfWidth - BottomHandPadding, halfHeight],
    "y",
  ],
};

type Axis = "x" | "y";

export type SideCardPosition =
  | "left"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom";

export const SideCardPositionLayout: Record<number, SideCardPosition[]> = {
  [1]: ["bottom"],
  [2]: ["bottom", "top-left"],
  [3]: ["bottom", "top-right", "top-left"],
  [4]: ["bottom", "left", "top", "right"],
  [5]: ["bottom", "left", "top-left", "top-right", "right"],
};

export class SideCardNode extends TwoDNode<PlaySceneContext> {
  public playerPosition: SideCardPosition = "left";
  public cardNode: LoadedImageNode;
  public enterAnimationEnabled: boolean = false;
  public enterAnimationAxis: Axis = "x";
  public enterAnimation: AnimationNode<PlaySceneContext>;

  public enterAnimationUpdated = (value: number) => {
    if (this.enterAnimationAxis === "x") {
      v_set(this.cardNode.offset, value, 0);
    } else {
      v_set(this.cardNode.offset, 0, value);
    }
  };

  constructor(id: string) {
    super(id);

    this.cardNode = new LoadedImageNode(`${id}-card`, "CardBackBlack");
    this.cardNode.width = CardWidth;
    this.cardNode.height = CardHeight;
    this.addChild(this.cardNode);

    this.enterAnimation = new AnimationNode(`${id}-enter-animation`);
    this.enterAnimation.durationMs = 800;
    this.enterAnimation.easing = "inOutCubic";
    this.enterAnimation.startValue = 0;
    this.enterAnimation.endValue = 0;
    this.enterAnimation.updateListeners.add(this.enterAnimationUpdated);
    this.addChild(this.enterAnimation);
  }

  public update = () => {
    const halfWidth = (this.container?.width ?? 0) / 2;
    const halfHeight = (this.container?.height ?? 0) / 2;
    const [offset, axis] = PositionMap[this.playerPosition](
      halfWidth,
      halfHeight
    );
    v_set(this.offset, offset);
    this.enterAnimationAxis = axis;
    if (!this.enterAnimation.isRunning) {
      this.cardNode.offset = [0, 0];
    }
  };

  public onMount = () => {
    if (this.enterAnimationEnabled) {
      this.enterAnimation.start();
    }
  };
}
