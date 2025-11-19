import { ButtonNode } from "../../sceneGraph/nodes/2d/ButtonNode";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import type { ShapeTheme } from "../../sceneGraph/scene/Theme";
import {
  ActionButtonDisabledTheme,
  ActionButtonTextTheme,
  ActionButtonTheme,
  LightenColor05,
} from "../constants/Themes";

const HoverTheme: ShapeTheme = {
  ...ActionButtonTheme,
  backgroundColor: LightenColor05,
};

const ActiveTheme: ShapeTheme = {
  ...ActionButtonTheme,
  backgroundColor: LightenColor05,
};

export class ActionButtonNode extends ButtonNode {
  private state: "normal" | "hovered" | "active" = "normal";
  private disabled = false;
  public onClick?: () => void;
  public overlayNode: RectNode;

  constructor(nodeId: string) {
    super(nodeId);
    this.rectNode.theme = ActionButtonTheme;
    this.textNode.theme = ActionButtonTextTheme;

    this.overlayNode = new RectNode(`${this.id}-overlay`);
    this.overlayNode.opacity = 0;
    this.addChild(this.overlayNode);

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

  public update = () => {
    this.overlayNode.width = this.rectNode.width;
    this.overlayNode.height = this.rectNode.height;
  };

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
      this.rectNode.theme = ActionButtonTheme;
      if (this.state === "normal") {
        this.overlayNode.opacity = 0;
        this.container?.setCursor("default");
      } else if (this.state === "hovered") {
        this.overlayNode.opacity = 1;
        this.overlayNode.theme = HoverTheme;
        this.container?.setCursor("pointer");
      } else {
        this.overlayNode.opacity = 1;
        this.overlayNode.theme = ActiveTheme;
        this.container?.setCursor("pointer");
      }
    }
  };
}
