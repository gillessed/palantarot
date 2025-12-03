import { CircleNode } from "../../sceneGraph/nodes/2d/CircleNode";
import { SvgNode } from "../../sceneGraph/nodes/2d/SvgNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { SvgPaths } from "../assets/SvgPaths";
import type { Animate } from "../utils/Animate";
import { PlayerNodeColors } from "./PlayerNodeConstants";

const CheckmarkScale = 14;
const BackgroundColor = "#dee2e6";

const SvgReadyTheme = { backgroundColor: "#0bae4a" };
const SvgUnreadyTheme = { backgroundColor: "#c92a2a" };

export class PlayerReadyNode extends TwoDNode {
  private ready = false;

  public svgNode: SvgNode;
  public circleNode: CircleNode;

  constructor(id: string) {
    super(id);

    this.circleNode = new CircleNode(`${id}-circle`);
    this.circleNode.radius = 15;
    this.circleNode.theme = {
      backgroundColor: BackgroundColor,
      borderColor: PlayerNodeColors.BorderColor,
      borderWidth: 3,
    };
    this.addChild(this.circleNode);

    this.svgNode = new SvgNode(`${id}-svg`);
    this.svgNode.path = SvgPaths.Cross;
    this.svgNode.scale = [CheckmarkScale, CheckmarkScale];
    this.svgNode.theme = SvgUnreadyTheme;
    this.addChild(this.svgNode);
  }

  public setReady = (ready: boolean, animate: Animate) => {
    // TODO: animate
    this.ready = ready;
    this.svgNode.theme = ready ? SvgReadyTheme : SvgUnreadyTheme;
    this.svgNode.path = ready ? SvgPaths.Checkmark : SvgPaths.Cross;
  };
  public getReady = () => this.ready;
}
