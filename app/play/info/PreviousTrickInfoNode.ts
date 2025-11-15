import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { PreviousTrickInfoNodeId } from "../NodeIds";

export class PreviousTrickInfoNode extends TwoDNode {
  constructor() {
    super(PreviousTrickInfoNodeId);

    this.painter = {
      render: this.paint
    };
  }

  public paint = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#FF00FF"
    ctx.rect(0, -200, 200, 100);
    ctx.fill();
  }
}