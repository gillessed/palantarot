import { ButtonNode } from "../../sceneGraph/nodes/2d/ButtonNode";
import {
  ActionButtonActiveTheme,
  ActionButtonDisabledTheme,
  ActionButtonHoverTheme,
  ActionButtonTextTheme,
  ActionButtonTheme,
} from "../constants/Themes";

export class ActionButtonNode extends ButtonNode {
  private state: "normal" | "hovered" | "active" = "normal";
  private disabled = false;
  public onClick?: () => void;

  constructor(nodeId: string) {
    super(nodeId);
    this.rectNode.theme = ActionButtonTheme;
    this.textNode.theme = ActionButtonTextTheme;

    this.rectNode.mouseEntered = () => {
      this.state = "hovered";
      this.updateUi();
    };
    this.rectNode.mouseExited = () => {
      this.state = "normal";
      this.updateUi();
    };
    this.rectNode.mouseDown = () => {
      this.state = "active";
      this.updateUi();
    };
    this.rectNode.mouseUp = () => {
      this.state = "hovered";
      this.updateUi();
      if (!this.disabled) {
        this.onClick?.();
      }
    };
  }

  public setDisabled = (disabled: boolean) => {
    this.disabled = disabled;
    this.updateUi();
  };

  public updateUi = () => {
    if (this.disabled) {
      if (this.state === "hovered" || this.state === "active") {
        this.container?.setCursor("not-allowed");
      } else {
        this.container?.setCursor("default");
      }
      this.rectNode.theme = ActionButtonDisabledTheme;
    } else {
      if (this.state === "normal") {
        this.rectNode.theme = ActionButtonTheme;
        this.container?.setCursor("default");
      } else if (this.state === "hovered") {
        this.rectNode.theme = ActionButtonHoverTheme;
        this.container?.setCursor("pointer");
      } else {
        this.rectNode.theme = ActionButtonActiveTheme;
        this.container?.setCursor("pointer");
      }
    }
  };
}
