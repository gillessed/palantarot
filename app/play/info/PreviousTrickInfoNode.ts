import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { PreviousTrickInfoNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";
import { PlayColors_Gray } from "../constants/PlayColors";

export class PreviousTrickInfoNode extends TwoDNode<PlaySceneContext> {
  constructor() {
    super(PreviousTrickInfoNodeId);
  }

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = PlayColors_Gray[2];
    ctx.lineWidth = 2;
    ctx.beginPath();
    pathRoundedRectangle(ctx, 10, 0, 300, 150, 10);
    ctx.stroke();
  };
}
