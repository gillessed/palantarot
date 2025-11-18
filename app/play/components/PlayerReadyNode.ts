import { CircleNode } from "../../sceneGraph/nodes/2d/CircleNode";
import { SvgNode } from "../../sceneGraph/nodes/2d/SvgNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { SvgPaths } from "../assets/SvgPaths";
import type { PlaySceneContext } from "../PlaySceneContext";
import { PlayerNodeBorderColor } from "./PlayerNodeConstants";

const CheckmarkScale = 0.15;
const BackgroundColor = "#dee2e6";

const SvgReadyTheme = { backgroundColor: "#0bae4a" };
const SvgUnreadyTheme = { backgroundColor: "#c92a2a" };

export class PlayerReadyNode extends TwoDNode<PlaySceneContext> {
  private ready = false;

  public svgNode: SvgNode<PlaySceneContext>;
  public circleNode: CircleNode<PlaySceneContext>;

  constructor(id: string) {
    super(id);

    this.circleNode = new CircleNode(`${id}-circle`);
    this.circleNode.radius = 15;
    this.circleNode.theme = {
      backgroundColor: BackgroundColor,
      borderColor: PlayerNodeBorderColor,
      borderWidth: 3,
    };
    this.addChild(this.circleNode);

    this.svgNode = new SvgNode(`${id}-svg`);
    this.svgNode.path = SvgPaths.Cross;
    this.svgNode.scale = [CheckmarkScale, CheckmarkScale];
    this.svgNode.theme = SvgUnreadyTheme;
    this.addChild(this.svgNode);
  }

  public setReady = (ready: boolean) => {
    this.ready = ready;
    this.svgNode.theme = ready ? SvgReadyTheme : SvgUnreadyTheme;
    this.svgNode.path = ready ? SvgPaths.Checkmark : SvgPaths.Cross;
  };
  public getReady = () => this.ready;
  public animateReady = (ready: boolean) => {
    this.ready = ready;
    // TODO: Animate transition
    this.setReady(ready);
  };
}
