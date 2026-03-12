import type { Card } from "../../../../server/play/model/Card";
import { RectNode } from "../../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { CardNode, type CardFaceState } from "../../components/CardNode";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../../constants/CardConstants";
import { PrimaryColor } from "../../constants/Themes";
import { DogCardsNodeId } from "../../NodeIds";
import type { Animate } from "../../utils/Animate";

// support 6 card dogs

export class DogCardsNode extends TwoDNode {
  public dogSize: number;
  public cardNodes: (CardNode | undefined)[] = [];

  public handleClick: ((cardNode: CardNode, index: number) => void) | undefined;
  public handleMouseEntered:
    | ((cardNode: CardNode, index: number) => void)
    | undefined;
  public handleMouseExited:
    | ((cardNode: CardNode, index: number) => void)
    | undefined;

  constructor(cards: readonly Card[]) {
    super(DogCardsNodeId);
    this.dogSize = cards.length;

    const width = this.getWidth();
    const backgroundNode = new RectNode(`${this.id}-background`);
    backgroundNode.setTheme({
      backgroundColor: PrimaryColor[5],
      borderRadius: 5,
    });
    backgroundNode.size.set({
      width: width + 2 * AreaBackgroundPadding,
      height: CardHeight + 2 * AreaBackgroundPadding,
    });
    this.addChild(backgroundNode);

    for (let i = 0; i < cards.length; i++) {
      const cardNode = new CardNode(`${this.id}-card-${i}`);
      cardNode.card.set(cards[i]);
      cardNode.faceState.set("face-down");
      cardNode.offset[0] = this.getCardOffsetForIndex(i);
      this.addChild(cardNode);
      this.setHandler(cardNode);
      this.cardNodes.push(cardNode);
    }
  }

  public setHandler = (cardNode: CardNode) => {
    cardNode.cardImageNode.mouseUp = () => {
      const cardIndex = this.cardNodes.indexOf(cardNode);
      this.handleClick?.(cardNode, cardIndex);
    };
    cardNode.cardImageNode.mouseEntered = () => {
      const cardIndex = this.cardNodes.indexOf(cardNode);
      this.handleMouseEntered?.(cardNode, cardIndex);
    };
    cardNode.cardImageNode.mouseExited = () => {
      const cardIndex = this.cardNodes.indexOf(cardNode);
      this.handleMouseExited?.(cardNode, cardIndex);
    };
  };

  public getWidth = () => {
    return (
      CardWidth * this.dogSize + AreaBackgroundPadding * (this.dogSize - 1)
    );
  };

  public getCardOffsetForIndex = (index: number) => {
    return Math.round(
      -this.getWidth() / 2 +
        CardWidth / 2 +
        (CardWidth + AreaBackgroundPadding) * index,
    );
  };

  public getLowestEmpty = () => {
    let lowestEmpty = 0;
    while (lowestEmpty < this.dogSize && this.cardNodes[lowestEmpty] != null) {
      lowestEmpty++;
    }
    return lowestEmpty >= this.dogSize ? -1 : lowestEmpty;
  };

  public turnOverAll = async (
    face: CardFaceState,
    animate: Animate,
  ): Promise<void> => {
    const promises: Promise<void>[] = [];
    for (const cardNode of this.cardNodes) {
      const promise = cardNode?.turnTo(face, animate);
      if (promise != null) {
        promises.push(promise);
      }
    }
    await Promise.all(promises);
  };

  public getAllCardNodes = (): CardNode[] => {
    return this.cardNodes.filter((maybeNode) => maybeNode != null);
  };

  public removeCardNode = (cardNode: CardNode) => {
    const index = this.cardNodes.indexOf(cardNode);
    cardNode.clearMouseHandlers();
    if (index >= 0) {
      this.cardNodes[index] = undefined;
    }
  };

  public clear = () => {
    for (let i = 0; i < this.dogSize; i++) {
      const cardNode = this.cardNodes[i];
      cardNode?.clearMouseHandlers();
      this.cardNodes[i] = undefined;
    }
  };
}
