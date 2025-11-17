import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import { LoadingScreenNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";
import { pathRoundedRectangle } from "./utils/pathRoundedRectangle";

const WidthRatio = 0.6;

export class LoadingScreenNode extends TwoDNode<PlaySceneContext> {
  public fillAmount = 0;

  constructor() {
    super(LoadingScreenNodeId);
  }

  public update = () => {
    const width = this.container?.width ?? 0;
    const height = this.container?.height ?? 0;
    this.offset = [width / 2, height / 2];
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "48px BlenderProBold";
    ctx.fillText("Loading assets", 0, -10);

    ctx.lineWidth = 3;
    const screenWidth = this.container?.width ?? 0;
    const barWidth = WidthRatio * screenWidth;
    const rx = -barWidth / 2;

    ctx.save();
    ctx.beginPath();
    pathRoundedRectangle(ctx, rx, 10, barWidth * this.fillAmount, 40, 20, [
      false,
      false,
      true,
      true,
    ]);
    ctx.clip();
    ctx.beginPath();
    ctx.fillStyle = "rgba(256, 256, 256, 0.7)";
    pathRoundedRectangle(ctx, rx, 10, barWidth, 40, 20);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    pathRoundedRectangle(ctx, rx, 10, barWidth, 40, 20);
    ctx.stroke();
  };
}
