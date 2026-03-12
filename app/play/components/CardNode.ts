import type { Card } from "../../../server/play/model/Card";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import { createDefaultProperty } from "../../sceneGraph/property/Property";
import { getCardAssetKey } from "../assets/ImageAssets";
import { CardSize } from "../constants/CardConstants";
import { HighlightColor } from "../constants/Themes";
import type { Animate } from "../utils/Animate";
import { LoadedImageNode } from "./LoadedImageNode";

export type CardFaceState = "face-up" | "face-down";

export class CardNode extends TwoDNode {
  public faceState = createDefaultProperty<CardFaceState>("face-up");
  public card = createDefaultProperty<Card>(["T", "1"]);
  public hovered = createDefaultProperty(false);
  public cardImageNode: LoadedImageNode;
  public cardOverlayNode: RectNode;
  public flipAnimation: TimerNode;

  constructor(id: string) {
    super(id);

    this.cardImageNode = new LoadedImageNode(`${this.id}-image`);
    this.cardImageNode.size.set(CardSize);
    this.addChild(this.cardImageNode);

    this.cardOverlayNode = new RectNode(`${this.id}-image-overlay`);
    this.cardOverlayNode.ignoreMouseEvents = true;
    this.cardOverlayNode.size.set(CardSize);
    this.cardOverlayNode.setTheme({
      borderColor: HighlightColor[9],
      borderRadius: 10,
      borderWidth: 5,
      backgroundColor: "#0000",
    });
    this.cardOverlayNode.visible = false;
    this.addChild(this.cardOverlayNode);

    this.flipAnimation = new TimerNode(`${this.id}-flip-animation`);
    this.flipAnimation.easing = "inOutSine";
    this.flipAnimation.durationMs = 600;
    this.addChild(this.flipAnimation);
  }

  public updateCardAsset = () => {
    if (this.faceState.get() === "face-down") {
      this.cardImageNode.assetKey.set("CardBackBlack");
    } else {
      this.cardImageNode.assetKey.set(getCardAssetKey(this.card.get()));
    }
  };

  public turnTo = async (
    faceState: CardFaceState,
    animate: Animate,
  ): Promise<void> => {
    if (this.faceState.get() === faceState) {
      return;
    }
    if (animate === "instant") {
      this.faceState.set(faceState);
      return;
    } else {
      return new Promise((resolve) => {
        this.flipAnimation.reversed = faceState === "face-up";
        this.flipAnimation.startValue = -1;
        this.flipAnimation.endValue = 1;
        this.flipAnimation.start({
          onChanged: (value) => {
            this.cardImageNode.scale[0] = Math.abs(value);
            this.cardImageNode.offset[1] = -20 * (1 - Math.abs(value));
            if (value < 0) {
              this.faceState.set("face-up");
            } else {
              this.faceState.set("face-down");
            }
          },
          onFinished: () => {
            this.cardImageNode.scale[0] = 1;
            this.cardImageNode.offset[1] = 0;
            this.faceState.set(faceState);
            resolve();
          },
        });
      });
    }
  };

  public onMount = () => {
    const cleanups = [
      this.faceState.getAndListen(() => {
        this.updateCardAsset();
      }),
      this.card.getAndListen(() => {
        this.updateCardAsset();
      }),
      this.hovered.getAndListen((value) => {
        this.cardOverlayNode.visible = value;
      }),
    ];
    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  };

  public clearMouseHandlers = () => {
    this.cardImageNode.mouseUp = undefined;
    this.cardImageNode.mouseEntered = undefined;
    this.cardImageNode.mouseExited = undefined;
    this.hovered.set(false);
  };
}
