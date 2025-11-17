import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { DogInfoNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";
import { PlayColors_Gray } from "../constants/PlayColors";

export class DogInfoNode extends TwoDNode<PlaySceneContext> {
  constructor() {
    super(DogInfoNodeId);
  }

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = PlayColors_Gray[2];
    ctx.lineWidth = 2;
    ctx.beginPath();
    pathRoundedRectangle(ctx, 10, 160, 180, 150, 10);
    ctx.stroke();
  };
}
