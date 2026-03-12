import type { Size } from "recharts/types/util/types";
import { v4 as uuid } from "uuid";
import { Card } from "../../../server/play/model/Card";
import { findCardInsertIndex } from "../../../shared/utils/findCardInsertIndex";
import { setsEqual } from "../../../shared/utils/setsEqual";
import {
  interpolateVector,
  v_copy,
  Vector,
} from "../../sceneGraph/math/Vector";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import { setDiff } from "../../sceneGraph/utils/setDiff";
import { getCardAssetKey } from "../assets/ImageAssets";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../constants/CardConstants";
import { DarkenColor2 } from "../constants/Themes";
import { PlayerHandNodeId } from "../NodeIds";
import { PlaySceneContext } from "../PlaySceneContext";
import { Animate } from "../utils/Animate";
import { CardNodeList } from "../utils/CardNodeList";
import { transferNode } from "../utils/transferNode";
import { CardNode } from "./CardNode";

interface CardChangeAnimation {
  readonly type: "insert" | "remove";
  readonly timer: TimerNode;
  readonly animatePosition: Vector;
}

interface ClickableCardAnimation {
  readonly adding: Set<string>;
  readonly removing: Set<string>;
  readonly timer: TimerNode;
}

export class PlayerHandNode extends TwoDNode {
  public context: PlaySceneContext;
  public backgroundNode: RectNode;
  public cardListNode: TwoDNode;
  public cardNodes: CardNodeList;
  public selectedCards = new Set<number>();
  public activeAnimations = new Map<string, CardChangeAnimation>();
  public enterAnimation: TimerNode;
  public handleClick: ((cardNode: CardNode, index: number) => void) | undefined;
  public handleMouseEntered:
    | ((cardNode: CardNode, index: number) => void)
    | undefined;
  public handleMouseExited:
    | ((cardNode: CardNode, index: number) => void)
    | undefined;
  private handWidth: number = 0;
  private clickableCards = new Set<string>();
  private clickableCardAnimation: ClickableCardAnimation | undefined;

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

    this.cardNodes = new CardNodeList(this.cardListNode, {
      handleClick: (cardNode, index) => this.handleClick?.(cardNode, index),
      handleMouseEntered: (cardNode, index) =>
        this.handleMouseEntered?.(cardNode, index),
      handleMouseExited: (cardNode, index) =>
        this.handleMouseExited?.(cardNode, index),
    });

    this.enterAnimation = new TimerNode(`${PlayerHandNodeId}-enter-animation`);
    this.enterAnimation.startValue = CardHeight / 2;
    this.enterAnimation.endValue = 0;
    this.enterAnimation.durationMs = 750;
    this.enterAnimation.easing = "outCubic";
    this.addChild(this.enterAnimation);

    if (cards.length > 0) {
      this.dealHand(cards, "instant");
    }
  }

  public onMount = (nodeManager: NodeManager) => {
    const removeListener = nodeManager.size.getAndListen(
      ({ width, height }: Size) => {
        this.offset[1] = height / 2;
        const newWidth = Math.max(width - 500, 0);
        if (this.handWidth !== newWidth) {
          this.handWidth = newWidth;
          this.offset[0] = 150;
          this.backgroundNode.size.setWidth(
            this.handWidth + 2 * AreaBackgroundPadding,
          );
          this.layoutCards();
        }
      },
    );
    return () => {
      removeListener();
    };
  };

  public dealHand = async (cards: ReadonlyArray<Card>, animate: Animate) => {
    this.cardNodes.clear();
    for (const card of cards) {
      this.cardNodes.add(card);
    }
    this.layoutCards();
    if (animate === "animate") {
      return new Promise<void>((resolve) => {
        this.enterAnimation.start({
          onChanged: (value: number) => (this.cardListNode.offset[1] = value),
          onFinished: () => {
            this.cardListNode.offset[1] = 0;
            resolve();
          },
        });
      });
    } else {
      this.cardListNode.offset[1] = 0;
    }
  };

  private getHandLeft = () => {
    return -(this.handWidth - CardWidth) / 2;
  };

  private getCardOffsets = () => {
    const offsetFactors = [];
    for (let i = 0; i < this.cardNodes.length; i++) {
      const card = this.cardNodes.getCard(i);
      const animation = this.activeAnimations.get(`${card}`);
      if (animation == null) {
        offsetFactors.push(1);
      } else {
        offsetFactors.push(animation.timer.value.get());
      }
    }
    const totalOffsetFactors = offsetFactors.reduce((val, acc) => val + acc, 0);
    const overlap = Math.min(
      (this.handWidth - CardWidth) / (totalOffsetFactors - 1),
      CardWidth,
    );
    const cardOffsets = offsetFactors.map((factor) => factor * overlap);
    return cardOffsets;
  };

  private getCardYOffset = (card: Card) => {
    const cardKey = getCardAssetKey(card);
    if (this.clickableCardAnimation?.adding.has(cardKey)) {
      return this.clickableCardAnimation?.timer.value.get() * -20;
    } else if (this.clickableCardAnimation?.removing.has(cardKey)) {
      return (1 - this.clickableCardAnimation?.timer.value.get()) * -20;
    } else {
      return this.clickableCards.has(getCardAssetKey(card)) ? -20 : 0;
    }
  };

  private layoutCards = () => {
    const cardOffsets = this.getCardOffsets();
    let x = this.getHandLeft();
    for (let index = 0; index < this.cardNodes.length; index++) {
      const cardNode = this.cardNodes.get(index);
      const card = cardNode.card.get();
      const animation = this.activeAnimations.get(`${card}`);
      const cardYOffset = this.getCardYOffset(card);
      if (animation != null) {
        const handPosition: Vector = [Math.round(x), cardYOffset];
        let offset: Vector;
        offset = interpolateVector(
          animation.animatePosition,
          handPosition,
          animation.timer.value.get(),
        );
        cardNode.offset = offset;
      } else {
        cardNode.offset = [Math.round(x), cardYOffset];
      }
      x += cardOffsets[index];
    }
  };

  private createAnimationTimer = (durationMs: number) => {
    const timerNode = new TimerNode(`${PlayerHandNodeId}-animation-${uuid()}`);
    timerNode.durationMs = durationMs;
    timerNode.easing = "inOutSine";
    return timerNode;
  };

  public insertCards = async (
    cardsToInsert: CardNode[],
    animate: Animate,
  ): Promise<void> => {
    for (let i = 0; i < cardsToInsert.length; i++) {
      const node = cardsToInsert[i];
      const card = cardsToInsert[i].card.get();
      const handCards = this.cardNodes.getCards();
      const insertIndex = findCardInsertIndex(handCards, card);
      transferNode(node, this.cardListNode, insertIndex);
      this.cardNodes.insert(node, insertIndex);
    }

    if (animate === "animate") {
      const timer = this.createAnimationTimer(500);
      this.addChild(timer);
      for (let i = 0; i < cardsToInsert.length; i++) {
        const node = cardsToInsert[i];
        const card = cardsToInsert[i].card.get();
        this.activeAnimations.set(`${card}`, {
          type: "insert",
          timer,
          animatePosition: v_copy(node.offset),
        });
      }
      return new Promise((resolve) => {
        timer.start({
          onChanged: () => {
            this.layoutCards();
          },
          onFinished: () => {
            for (const cardNode of cardsToInsert) {
              this.cardNodes.setHandler(cardNode);
              this.activeAnimations.delete(`${cardNode.card.get()}`);
              timer.removeSelf();
            }
            resolve();
          },
        });
      });
    } else {
      this.layoutCards();
    }
  };

  public removeCard = async (
    index: number,
    targetPosition: Vector,
  ): Promise<void> => {
    const timer = this.createAnimationTimer(500);
    timer.reversed = true;
    const node = this.cardNodes.get(index);
    const card = node.card.get();

    this.activeAnimations.set(`${card}`, {
      type: "remove",
      timer,
      animatePosition: targetPosition,
    });
    this.addChild(timer);
    node.clearMouseHandlers();

    return new Promise((resolve) => {
      timer.start({
        onChanged: () => {
          this.layoutCards();
        },
        onFinished: () => {
          this.activeAnimations.delete(`${card}`);
          this.cardNodes.remove(node);
          timer.removeSelf();
          this.layoutCards();
          resolve();
        },
      });
    });
  };

  public setClickableCards = async (
    cards: readonly Card[],
    animate: Animate,
  ): Promise<void> => {
    if (this.clickableCardAnimation != null) {
      this.clickableCardAnimation.timer.stop();
      this.clickableCardAnimation.timer.removeSelf();
    }
    const newClickableCards = new Set<string>();
    for (const card of cards) {
      newClickableCards.add(getCardAssetKey(card));
    }
    if (setsEqual(newClickableCards, this.clickableCards)) {
      return;
    }
    const { added, removed } = setDiff(this.clickableCards, newClickableCards);
    this.clickableCards = newClickableCards;
    for (const cardNode of this.cardNodes.nodes) {
      if (!newClickableCards.has(getCardAssetKey(cardNode.card.get()))) {
        cardNode.hovered.set(false);
      }
    }
    if (animate === "animate") {
      const timer = this.createAnimationTimer(250);
      this.addChild(timer);
      this.clickableCardAnimation = {
        adding: new Set(added),
        removing: new Set(removed),
        timer,
      };
      return new Promise((resolve) => {
        timer.start({
          onChanged: () => {
            this.layoutCards();
          },
          onFinished: () => {
            this.clickableCardAnimation = undefined;
            timer.removeSelf();
            this.layoutCards();
            resolve();
          },
        });
      });
    } else {
      this.layoutCards();
    }
  };
}
