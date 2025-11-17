import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { PartnerCallInfoNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";
import { PlayColors_Gray } from "../constants/PlayColors";

export class PartnerCallInfoNode extends TwoDNode<PlaySceneContext> {
  constructor() {
    super(PartnerCallInfoNodeId);
  }

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = PlayColors_Gray[2];
    ctx.lineWidth = 2;
    ctx.beginPath();
    pathRoundedRectangle(ctx, 200, 160, 110, 150, 10);
    ctx.stroke();
  };
}
