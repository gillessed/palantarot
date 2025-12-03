import { RectNode, RectTheme } from "../../sceneGraph/nodes/2d/RectNode";
import type { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { ShapeTheme } from "../../sceneGraph/scene/Theme";
import {
  ActionButtonDisabledTheme,
  DarkenColor05,
  DefaultActionButtonTheme,
  HighlightColor,
  LightenColor05,
} from "../constants/Themes";

const HoverTheme: RectTheme = {
  backgroundColor: LightenColor05,
};

const ActiveTheme: RectTheme = {
  backgroundColor: DarkenColor05,
};

export class ActionButtonNode<InternalNode extends TwoDNode> extends RectNode {
  private selected = false;
  private state: "normal" | "hovered" | "active" = "normal";
  private disabled = false;
  private baseTheme = DefaultActionButtonTheme;
  public onClick?: () => void;
  public overlayNode: RectNode;
  private removeSizeListener?: () => void;
  public internalNode: InternalNode;

  constructor(nodeId: string, internalNode: InternalNode) {
    super(nodeId);
    this.setTheme(this.baseTheme);
    this.internalNode = internalNode;

    this.overlayNode = new RectNode(`${this.id}-overlay`);
    this.overlayNode.opacity = 0;
    this.addChild(this.overlayNode);

    this.mouseEntered = () => {
      this.state = "hovered";
      this.updateUi();
    };
    this.mouseExited = () => {
      this.state = "normal";
      this.updateUi();
    };
    this.mouseDown = () => {
      this.state = "active";
      this.updateUi();
    };
    this.mouseUp = () => {
      this.state = "hovered";
      this.updateUi();
      if (!this.disabled) {
        this.onClick?.();
      }
    };
    this.addChild(internalNode);
  }

  public setBaseTheme = (theme: ShapeTheme) => {
    this.baseTheme = theme;
    this.updateUi();
  };

  public onMount = () => {
    this.removeSizeListener = this.size.getAndListen((size) => {
      this.overlayNode.size.set(size);
    });
  };

  public onUnmount = () => {
    this.removeSizeListener?.();
  };

  public setDisabled = (disabled: boolean) => {
    this.disabled = disabled;
    this.updateUi();
  };

  public setSelected = (selected: boolean) => {
    this.selected = selected;
    this.updateUi();
  };

  public updateUi = () => {
    if (this.disabled) {
      if (this.state === "hovered" || this.state === "active") {
        this.container?.setCursor("not-allowed");
      } else {
        this.container?.setCursor("default");
      }
      this.setTheme(ActionButtonDisabledTheme);
    } else if (this.selected) {
      this.container?.setCursor("default");
      this.setTheme({
        ...this.baseTheme,
        borderColor: HighlightColor[10],
      });
      this.overlayNode.opacity = 1;
      this.overlayNode.setTheme(ActiveTheme);
    } else {
      this.setTheme(this.baseTheme);
      if (this.state === "normal") {
        this.overlayNode.opacity = 0;
        this.container?.setCursor("default");
      } else if (this.state === "hovered") {
        this.overlayNode.opacity = 1;
        this.overlayNode.setTheme(HoverTheme);
        this.container?.setCursor("pointer");
      } else {
        this.overlayNode.opacity = 1;
        this.overlayNode.setTheme(ActiveTheme);
        this.container?.setCursor("pointer");
      }
    }
  };

  public setInternal = (node: InternalNode) => {
    if (this.internalNode != null) {
      this.removeChild(this.internalNode);
    }
    this.internalNode = node;
    this.addChild(node);
  };
}
