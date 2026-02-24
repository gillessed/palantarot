import type { Size } from "recharts/types/util/types";
import { Card } from "../../../server/play/model/Card";
import { findCardIndex } from "../../../shared/utils/findCardIndex";
import { Vector } from "../../sceneGraph/math/Vector";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../constants/CardConstants";
import { DarkenColor2 } from "../constants/Themes";
import { PlayerHandNodeId } from "../NodeIds";
import { PlaySceneContext } from "../PlaySceneContext";
import { CardNode } from "./CardNode";

export interface InsertingNode {
  readonly node: CardNode;
  readonly index: number;
  readonly moveTo: Vector;
}

export class PlayerHandNode extends TwoDNode {
  public context: PlaySceneContext;
  public backgroundNode: RectNode;
  public cardListNode: TwoDNode;
  public cardNodes: CardNode[] = [];
  public selectedCards = new Set<number>();
  public insertingNodes: InsertingNode[] = [];
  public enterAnimation: TimerNode;
  public insertAnimation: TimerNode;
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

    this.enterAnimation = new TimerNode(`${PlayerHandNodeId}-enter-animation`);
    this.enterAnimation.startValue = CardHeight / 2;
    this.enterAnimation.endValue = 0;
    this.enterAnimation.durationMs = 750;
    this.enterAnimation.easing = "outCubic";
    this.addChild(this.enterAnimation);

    this.insertAnimation = new TimerNode(`${PlayerHandNodeId}-insert-animation`);
    this.insertAnimation.durationMs = 750;
    this.addChild(this.insertAnimation);

    if (cards.length > 0) {
      this.dealHand(cards, false);
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

  public dealHand = (cards: ReadonlyArray<Card>, animate: boolean) => {
    for (const node of this.cardNodes) {
      this.removeChild(node);
    }
    this.cardNodes.splice(0);
    for (const card of cards) {
      const cardNode = new CardNode(
        `${PlayerHandNodeId}-card-${card}`,
      );
      this.cardNodes.push(cardNode);
      this.cardListNode.addChild(cardNode);
    }
    this.layoutCards();
    if (animate) {
      this.enterAnimation.start({
        onChanged: (value: number) => (this.cardListNode.offset[1] = value),
        onFinished: () => (this.cardListNode.offset[1] = 0),
      });
    } else {
      this.cardListNode.offset[1] = 0;
    }
  };

  private layoutCards = () => {
    const cardCount = this.cardNodes.length;
    if (cardCount === 0) {
      return;
    } else {
      const insertValue = this.insertAnimation.value.get();
      const overlap = Math.min(
        (this.handWidth - CardWidth) / (cardCount + (this.insertingNodes.length * insertValue) - 1),
        CardWidth
      );
      const insertCountMap = new Map<number, number>();
      for (const node of this.insertingNodes) {
        insertCountMap.set(node.index, (insertCountMap.get(node.index) ?? 0) + 1);
      }
      let x = -(this.handWidth - CardWidth) / 2;
      for (let index = 0; index < this.cardNodes.length; index++) {
        const insertingSpaceCount = insertCountMap.get(index) ?? 0;
        x += overlap * insertValue * insertingSpaceCount;
        const cardNode = this.cardNodes[index];
        cardNode.offset[0] = Math.round(x);
        x += overlap;
      }
    }
  };

  // total_width = card_width + overlap * (#cards - 1) + overlap * insert_value * insert_count
  // total_width - card_width = overlap * (#cards - 1) + overlap * insert_value * insert_count
  // total_width - card_width = overlap * (#cards - 1 + insert_value * insert_count)


  public insertCards = async (cardsToInsert: CardNode[]): Promise<void> => {
    const insertingNodes: InsertingNode[] = [];
    const handCards = this.cardNodes.map((node) => node.card.get());
    for (let i = 0; i < cardsToInsert.length; i++) {
      const node = cardsToInsert[i];
      const card = cardsToInsert[i].card.get();
      const index = findCardIndex(handCards, card);
      insertingNodes.push({
        node,
        index,
        moveTo: [0, 0],
      });
    }
    this.insertAnimation.start({
      onChanged: () => {
        this.layoutCards();
      },
      onFinished: () => {
        this.insertingNodes = [];
      }
    })
  }
}
