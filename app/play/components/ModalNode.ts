import type { Size } from "recharts/types/util/types";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import { DarkenColor2, PrimaryColor } from "../constants/Themes";

export class ModalNode extends RectNode {
  private fadeAnimation: TimerNode;
  private translateAnimation: TimerNode;

  constructor(id: string) {
    super(id);
    this.theme = {
      backgroundColor: PrimaryColor[7],
      borderRadius: 25,
      borderColor: DarkenColor2,
      borderWidth: 5,
    };

    this.fadeAnimation = new TimerNode(`${this.id}-fade`);
    this.fadeAnimation.durationMs = 1_000;
    this.fadeAnimation.easing = "inOutCubic";
    this.addChild(this.fadeAnimation);

    this.translateAnimation = new TimerNode(`${this.id}-translate`);
    this.translateAnimation.durationMs = 1_000;
    this.translateAnimation.easing = "outCubic";
    this.translateAnimation.endValue = 0;
    this.addChild(this.translateAnimation);
  }

  public onMount = (nodeManager: NodeManager) => {
    const sizeCleanup = nodeManager.size.listen(({ height }: Size) => {
      this.translateAnimation.startValue = height;
    });
    const fadeValueCleanup = this.fadeAnimation.value.listen(
      (value: number) => {
        this.opacity = value;
      }
    );
    const fadeFinishedCleanup = this.fadeAnimation.finished.listen(() => {
      if (this.fadeAnimation.reversed) {
        this.visible = false;
      }
    });
    const translateValueCleanup = this.translateAnimation.value.listen(
      (value: number) => {
        this.offset[1] = value;
      }
    );
    const translateFinishedCleanup = this.translateAnimation.finished.listen(
      () => {
        if (this.fadeAnimation.reversed) {
          this.visible = false;
        }
      }
    );
    return () => {
      sizeCleanup();
      fadeValueCleanup();
      fadeFinishedCleanup();
      translateValueCleanup();
      translateFinishedCleanup();
    };
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
