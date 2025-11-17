import { ButtonNode } from "../../sceneGraph/nodes/2d/ButtonNode";
import type { PlaySceneContext } from "../PlaySceneContext";
import {
  ActionButtonActiveTheme,
  ActionButtonHoverTheme,
  ActionButtonTextTheme,
  ActionButtonTheme,
} from "../constants/Themes";

export class ActionButtonNode extends ButtonNode<PlaySceneContext> {
  public onClick?: () => void;
  constructor(nodeId: string) {
    super(nodeId);
    this.rectNode.theme = ActionButtonTheme;
    this.textNode.theme = ActionButtonTextTheme;

    this.rectNode.mouseEntered = () => {
      this.rectNode.theme = ActionButtonHoverTheme;
      this.container?.setCursor("pointer");
    };
    this.rectNode.mouseExited = () => {
      this.rectNode.theme = ActionButtonTheme;
      this.container?.setCursor("default");
    };
    this.rectNode.mouseDown = () => {
      this.rectNode.theme = ActionButtonActiveTheme;
    };
    this.rectNode.mouseUp = () => {
      this.rectNode.theme = ActionButtonHoverTheme;
      this.onClick?.();
    };
  }
}
