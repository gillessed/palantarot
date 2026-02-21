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
  private dogSize: number;
  private cardNodes: CardNode[] = [];

  constructor(dogSize: number) {
    super(DogCardsNodeId);
    this.dogSize = dogSize;

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

    for (let i = 0; i < dogSize; i++) {
      const cardNode = new CardNode(`${this.id}-card-${i}`);
      cardNode.offset[0] = this.getCardOffsetForIndex(i);
      this.addChild(cardNode);
      this.cardNodes.push(cardNode);
    }
  }

  public getWidth = () => {
    return (
      CardWidth * this.dogSize + AreaBackgroundPadding * (this.dogSize - 1)
    );
  };

  public getCardOffsetForIndex = (index: number) => {
    return Math.round(
      -this.getWidth() / 2 +
        CardWidth / 2 +
        (CardWidth + AreaBackgroundPadding) * index
    );
  };

  public getLowestEmpty = () => {
    let lowestEmpty = 0;
    while (
      lowestEmpty < this.dogSize &&
      this.cardNodes[lowestEmpty].card.get() != null
    ) {
      lowestEmpty++;
    }
    return lowestEmpty;
  };

  public setAllFacedown = () => {};

  public addCard = (card: Card | undefined, face: CardFaceState) => {
    const lowestEmpty = this.getLowestEmpty();
    if (lowestEmpty === this.dogSize) {
      throw Error("Cannot insert a card into a full dog");
    }
    this.cardNodes[lowestEmpty].card.set(card);
    this.cardNodes[lowestEmpty].turnTo(face, "instant");
  };

  public turnOverAll = (face: CardFaceState, animate: Animate, onFinished?: () => {}) => {
    
    for (const cardNode of this.cardNodes) {
      cardNode.turnTo(face, animate);
    }
  };
}
