import type { Card } from "../../../server/play/model/Card";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import { createDefaultProperty } from "../../sceneGraph/property/Property";
import { getCardAssetKey } from "../assets/ImageAssets";
import { CardHeight, CardWidth } from "../constants/CardConstants";
import type { Animate } from "../utils/Animate";
import { LoadedImageNode } from "./LoadedImageNode";

export type CardFaceState = "face-up" | "face-down";

export class CardNode extends TwoDNode {
  private faceState: CardFaceState = "face-up";
  public card = createDefaultProperty<Card>(["T", "1"]);
  public cardImageNode: LoadedImageNode;
  public flipAnimation: TimerNode;

  constructor(id: string) {
    super(id);

    this.cardImageNode = new LoadedImageNode(`${this.id}-image`);
    this.cardImageNode.size.set({ width: CardWidth, height: CardHeight });
    this.addChild(this.cardImageNode);

    this.flipAnimation = new TimerNode(`${this.id}-flip-animation`);
    this.flipAnimation.easing = "inOutSine";
    this.flipAnimation.durationMs = 600;
    this.addChild(this.flipAnimation);
  }

  private setCardNodeAsset = (card: Card | undefined) => {
    if (this.faceState === "face-down") {
      this.cardImageNode.assetKey.set("CardBackBlack");
    } else {
      this.cardImageNode.assetKey.set(
        card != null ? getCardAssetKey(card) : undefined,
      );
    }
  };

  private setFaceState = (faceState: CardFaceState) => {
    this.faceState = faceState;
    this.setCardNodeAsset(this.card.get());
  };

  public turnTo = async (
    faceState: CardFaceState,
    animate: Animate,
  ): Promise<void> => {
    if (this.faceState === faceState) {
      return;
    }
    if (animate === "instant") {
      this.setFaceState(faceState);
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
              this.setFaceState("face-up");
            } else {
              this.setFaceState("face-down");
            }
          },
          onFinished: () => {
            this.cardImageNode.scale[0] = 1;
            this.cardImageNode.offset[1] = 0;
            this.setFaceState(faceState);
            resolve();
          },
        });
      });
    }
  };

  public onMount = () => {
    const cleanup = this.card.getAndListen((newCard: Card | undefined) => {
      this.setCardNodeAsset(newCard);
    });
    return () => {
      cleanup();
    };
  };
}
