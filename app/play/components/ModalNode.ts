import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import { DarkenColor2, PrimaryColor } from "../constants/Themes";

export class ModalNode extends RectNode {
  private fadeAnimation: AnimationNode;
  private translateAnimation: AnimationNode;

  constructor(id: string) {
    super(id);
    this.theme = {
      backgroundColor: PrimaryColor[7],
      borderRadius: 25,
      borderColor: DarkenColor2,
      borderWidth: 5,
    };

    this.fadeAnimation = new AnimationNode(`${this.id}-fade`);
    this.fadeAnimation.durationMs = 1_000;
    this.fadeAnimation.easing = "inOutCubic";
    this.fadeAnimation.updateListeners.add((value: number) => {
      this.opacity = value;
    });
    this.fadeAnimation.finishListeners.add(() => {
      if (this.fadeAnimation.reversed) {
        this.visible = false;
      }
    });
    this.addChild(this.fadeAnimation);

    this.translateAnimation = new AnimationNode(`${this.id}-translate`);
    this.translateAnimation.durationMs = 1_000;
    this.translateAnimation.easing = "outCubic";
    this.translateAnimation.endValue = 0;
    this.translateAnimation.updateListeners.add((value: number) => {
      this.offset[1] = value;
    });
    this.translateAnimation.finishListeners.add(() => {
      if (this.fadeAnimation.reversed) {
        this.visible = false;
      }
    });
    this.addChild(this.translateAnimation);
  }

  public update = () => {
    this.translateAnimation.startValue = this.container?.height ?? 0;
  };

  public fadeIn = () => {
    this.visible = true;
    this.fadeAnimation.reversed = false;
    this.fadeAnimation.start();
  };

  public fadeOut = () => {
    this.fadeAnimation.reversed = true;
    this.fadeAnimation.start();
  };

  public translateIn = () => {
    this.visible = true;
    this.translateAnimation.reversed = false;
    this.translateAnimation.start();
  };

  public translateOut = () => {
    this.translateAnimation.reversed = true;
    this.translateAnimation.start();
  };
}
