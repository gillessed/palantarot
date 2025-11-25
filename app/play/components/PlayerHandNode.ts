import type { Size } from "recharts/types/util/types";
import { Card } from "../../../server/play/model/Card";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { getCardAssetKey } from "../assets/ImageAssets";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../constants/CardConstants";
import { DarkenColor2 } from "../constants/Themes";
import { PlayerHandNodeId } from "../NodeIds";
import { PlaySceneContext } from "../PlaySceneContext";
import { LoadedImageNode } from "./LoadedImageNode";

export class PlayerHandNode extends TwoDNode {
  public context: PlaySceneContext;
  public backgroundNode: RectNode;
  public cardListNode: TwoDNode;
  public cardNodes: LoadedImageNode[] = [];
  public enterAnimation: AnimationNode;
  private handWidth: number = 0;

  constructor(context: PlaySceneContext, cards: ReadonlyArray<Card>) {
    super(PlayerHandNodeId);
    this.context = context;

    this.backgroundNode = new RectNode(`${PlayerHandNodeId}-background`);
    this.backgroundNode.size.set({
      width: 0,
      height: CardHeight + AreaBackgroundPadding * 2,
    });
    this.backgroundNode.theme = {
      backgroundColor: DarkenColor2,
      borderRadius: 10,
    };
    this.addChild(this.backgroundNode);

    this.cardListNode = new TwoDNode(`${PlayerHandNodeId}-cards`);
    this.cardListNode.offset[1] = CardHeight / 2;
    this.addChild(this.cardListNode);

    this.enterAnimation = new AnimationNode(
      `${PlayerHandNodeId}-enter-animation`
    );
    this.enterAnimation.startValue = CardHeight / 2;
    this.enterAnimation.endValue = 0;
    this.enterAnimation.updateListeners.add(
      (value: number) => (this.cardListNode.offset[1] = value)
    );
    this.enterAnimation.finishListeners.add(() => {
      this.cardListNode.offset[1] = 0;
    });
    this.enterAnimation.durationMs = 750;
    this.enterAnimation.easing = "outCubic";
    this.addChild(this.enterAnimation);

    if (cards.length > 0) {
      this.setHand(cards, false);
    }
  }

  public onMount = (nodeManager: NodeManager) => {
    const removeListener = nodeManager.size.listen(
      ({ width, height }: Size) => {
        this.offset[1] = height / 2;
        const newWidth = Math.max(width - 500, 0);
        if (this.handWidth !== newWidth) {
          this.handWidth = newWidth;
          this.offset[0] = 150;
          this.backgroundNode.size.setWidth(
            this.handWidth + 2 * AreaBackgroundPadding
          );
          this.layoutCards();
        }
      }
    );
    return () => {
      removeListener();
    };
  };

  public update = () => {};

  public setHand = (cards: ReadonlyArray<Card>, animate: boolean) => {
    for (const node of this.cardNodes) {
      this.removeChild(node);
    }
    this.cardNodes.splice(0);
    for (const card of cards) {
      const cardNode = new LoadedImageNode(
        `${PlayerHandNodeId}-card-${card}`,
        getCardAssetKey(card)
      );
      cardNode.size.set({ width: CardWidth, height: CardHeight });
      this.cardNodes.push(cardNode);
      this.cardListNode.addChild(cardNode);
    }
    this.layoutCards();
    if (animate) {
      this.enterAnimation.start();
    } else {
      this.cardListNode.offset[1] = 0;
    }
  };

  private layoutCards = () => {
    const cardCount = this.cardNodes.length;
    if (cardCount === 0) {
      return;
    } else if (cardCount === 1) {
      this.cardNodes[0].offset[1] = 0;
    } else {
      const overlap = Math.min(
        (this.handWidth - CardWidth) / (cardCount - 1),
        CardWidth
      );
      let x = -(this.handWidth - CardWidth) / 2;
      for (const card of this.cardNodes) {
        card.offset[0] = Math.round(x);
        x += overlap;
      }
    }
  };
}
