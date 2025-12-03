import type { Size } from "recharts/types/util/types";
import { v_set, type Vector } from "../../sceneGraph/math/Vector";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../constants/CardConstants";
import { PrimaryColor } from "../constants/Themes";
import { LoadedImageNode } from "./LoadedImageNode";

const TopOffsetFactor = 1 / 2;
const BottomHandPadding = 200;
export const SideCardPositions: {
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

export class SideCardNode extends TwoDNode {
  public playerPosition: SideCardPosition = "left";
  public cardNode: LoadedImageNode;
  public enterAnimationEnabled: boolean = false;
  public enterAnimationAxis: Axis = "x";
  public enterAnimation: TimerNode;
  public backgroundNode: RectNode;

  public enterAnimationUpdated = (value: number) => {
    if (this.enterAnimationAxis === "x") {
      v_set(this.cardNode.offset, value, 0);
    } else {
      v_set(this.cardNode.offset, 0, value);
    }
  };

  constructor(id: string) {
    super(id);

    this.backgroundNode = new RectNode(`${id}-background`);
    this.backgroundNode.size.set({
      width: CardWidth + 2 * AreaBackgroundPadding,
      height: CardHeight + 2 * AreaBackgroundPadding,
    });
    this.backgroundNode.theme = {
      backgroundColor: PrimaryColor[5],
      borderRadius: 5,
    };
    this.addChild(this.backgroundNode);

    this.cardNode = new LoadedImageNode(`${id}-card`, "CardBackBlack");
    this.cardNode.size.set({ width: CardWidth, height: CardHeight });
    this.addChild(this.cardNode);

    this.enterAnimation = new TimerNode(`${id}-enter-animation`);
    this.enterAnimation.durationMs = 800;
    this.enterAnimation.easing = "inOutCubic";
    this.enterAnimation.startValue = 0;
    this.enterAnimation.endValue = 0;
    this.addChild(this.enterAnimation);
  }

  private layout = (size: Size) => {
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    const [offset, axis] = SideCardPositions[this.playerPosition](
      halfWidth,
      halfHeight
    );
    v_set(this.offset, offset);
    this.enterAnimationAxis = axis;
    if (!this.enterAnimation.isRunning) {
      this.cardNode.offset = [0, 0];
    }
  };

  public onMount = (manager: NodeManager) => {
    if (this.enterAnimationEnabled) {
      this.enterAnimation.start({
        onChanged: this.enterAnimationUpdated,
      });
    }
    const removeSizeListener = manager.size.getAndListen(this.layout);
    return () => {
      removeSizeListener();
    };
  };
}
