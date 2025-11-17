import { SvgNode, type SvgTheme } from "../../sceneGraph/nodes/2d/SvgNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { SvgPaths } from "../assets/SvgPaths";
import {
  UiBackgroundColor,
  UiBorderColor,
  UiBorderWidth,
} from "../constants/Themes";
import type { PlaySceneContext } from "../PlaySceneContext";

const CheckmarkTheme: SvgTheme = {
  backgroundColor: "#0bae4a",
  borderColor: "#156630",
  borderWidth: 3,
};

export class CheckmarkNode extends TwoDNode<PlaySceneContext> {
  public svgNode: SvgNode<PlaySceneContext>;

  constructor(id: string) {
    super(id);

    this.blur = 2;

    this.svgNode = new SvgNode(`${id}-svg`);
    this.svgNode.path = SvgPaths.Checkmark;
    this.svgNode.theme = CheckmarkTheme;
    this.svgNode.scale = [0.6, 0.6];
    this.addChild(this.svgNode);
  }

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#8b8b8b";

    ctx.beginPath();
    ctx.arc(this.position[0], this.position[1], 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
}
