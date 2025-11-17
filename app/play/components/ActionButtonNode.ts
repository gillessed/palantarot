import { ButtonNode } from "../../sceneGraph/nodes/2d/ButtonNode";
import type { PlaySceneContext } from "../PlaySceneContext";
import {
  ActionButtonActiveTheme,
  ActionButtonHoverTheme,
  ActionButtonTextTheme,
  ActionButtonTheme,
} from "../constants/Themes";

export class ActionButtonNode extends ButtonNode<PlaySceneContext> {
  private hovered = false;
  public onClick?: () => void;
  constructor(nodeId: string) {
    super(nodeId);
    this.rectNode.theme = ActionButtonTheme;
    this.textNode.theme = ActionButtonTextTheme;

    this.rectNode.mouseEntered = () => {
      this.hovered = true;
      this.rectNode.theme = ActionButtonHoverTheme;
      this.container?.setCursor("pointer");
    };
    this.rectNode.mouseExited = () => {
      this.hovered = false;
      this.rectNode.theme = ActionButtonTheme;
      this.container?.setCursor("default");
    };
    this.rectNode.mouseDown = () => {
      this.rectNode.theme = ActionButtonActiveTheme;
    };
    this.rectNode.mouseUp = () => {
      this.rectNode.theme = this.hovered ? ActionButtonHoverTheme : ActionButtonTheme;
      this.onClick?.();
    };
  }
}
