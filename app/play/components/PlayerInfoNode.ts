import { type SvgTheme } from "../../sceneGraph/nodes/2d/SvgNode";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { TextTheme } from "../../sceneGraph/scene/Theme";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";

const CheckmarkTheme: SvgTheme = {
  backgroundColor: "#0bae4a",
  borderColor: "#156630",
  borderWidth: 3,
};

const PlayerNodeTextTheme: TextTheme = {
  fontFamily: "blenderProBold",
  fontSize: 24,
  textColor: "white",
};

export type PlayerInfoNodeAlignment = "left" | "right" | "top" | "bottom";
export const PlayerInfoNodeWidth = 300;
export const PlayerInfoNodeHeight = 60;
const ReadyColor = "#0bae4a";
const UnreadyColor = "#c92a2a";
const ReadyCircleSize = 15;
const BackgroundColor = "#696c70";
const BorderColor = "#4f5760";

export class PlayerInfoNode extends TwoDNode<PlaySceneContext> {
  public textNode: TextNode<PlaySceneContext>;
  public renderReady = true;
  public ready = false;
  public alignment: PlayerInfoNodeAlignment = "top";

  constructor(id: string) {
    super(id);
    this.textNode = new TextNode(`${id}-text`);
    this.textNode.textBaseline = "top";
    this.textNode.textAlign = "left";
    this.textNode.offset = [5, 5];
    this.textNode.theme = PlayerNodeTextTheme;
    this.addChild(this.textNode);
  }

  public animateReady = (ready: boolean) => {
    this.ready = ready;
    // Animate transition
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = BackgroundColor;
    ctx.strokeStyle = BorderColor;

    ctx.beginPath();
    pathRoundedRectangle(
      ctx,
      this.position[0],
      this.position[1],
      PlayerInfoNodeWidth,
      PlayerInfoNodeHeight,
      10
    );
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();

    if (this.renderReady) {
      const readyLightX =
        this.alignment === "top" || this.alignment === "bottom"
          ? PlayerInfoNodeWidth / 2
          : this.alignment === "right"
          ? PlayerInfoNodeWidth
          : 0;

      const readyLightY =
        this.alignment === "left" || this.alignment === "right"
          ? PlayerInfoNodeHeight / 2
          : this.alignment === "bottom"
          ? PlayerInfoNodeHeight
          : 0;
      ctx.beginPath();
      ctx.arc(
        this.position[0] + readyLightX,
        this.position[1] + readyLightY,
        ReadyCircleSize,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = BorderColor;
      ctx.fill();

      ctx.fillStyle = this.ready ? ReadyColor : UnreadyColor;
      ctx.beginPath();
      ctx.arc(
        this.position[0] + readyLightX,
        this.position[1] + readyLightY,
        ReadyCircleSize - 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };
}
