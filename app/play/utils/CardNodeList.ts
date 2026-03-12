import { Card } from "../../../server/play/model/Card";
import { isCardEqual } from "../../../shared/utils/isCardEqual";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { CardNode } from "../components/CardNode";

export class CardNodeList {
  public nodes: CardNode[] = [];
  public container: TwoDNode;
  public handleClick?: (cardNode: CardNode, index: number) => void;
  public handleMouseEntered?: (cardNode: CardNode, index: number) => void;
  public handleMouseExited?: (cardNode: CardNode, index: number) => void;

  constructor(
    container: TwoDNode,
    handlers?: {
      handleClick?: (cardNode: CardNode, index: number) => void;
      handleMouseEntered?: (cardNode: CardNode, index: number) => void;
      handleMouseExited?: (cardNode: CardNode, index: number) => void;
    },
  ) {
    this.container = container;
    this.handleClick = handlers?.handleClick;
    this.handleMouseEntered = handlers?.handleMouseEntered;
    this.handleMouseExited = handlers?.handleMouseExited;
  }

  public clear = () => {
    for (const node of this.nodes) {
      node.removeSelf();
    }
    this.nodes = [];
  };

  public setHandler = (cardNode: CardNode) => {
    cardNode.cardImageNode.mouseUp = () => {
      const cardIndex = this.nodes.indexOf(cardNode);
      this.handleClick?.(cardNode, cardIndex);
    };
    cardNode.cardImageNode.mouseEntered = () => {
      const cardIndex = this.nodes.indexOf(cardNode);
      this.handleMouseEntered?.(cardNode, cardIndex);
    };
    cardNode.cardImageNode.mouseExited = () => {
      const cardIndex = this.nodes.indexOf(cardNode);
      this.handleMouseExited?.(cardNode, cardIndex);
    };
  };

  public createNode = (card: Card) => {
    const cardNode = new CardNode(`${this.container.id}-card-${card}`);
    this.setHandler(cardNode);
    cardNode.card.set(card);
    return cardNode;
  };

  public add = (card: Card) => {
    const cardNode = this.createNode(card);
    this.setHandler(cardNode);
    this.nodes.push(cardNode);
    this.container.addChild(cardNode);
  };

  public insert = (cardNode: CardNode, index: number) => {
    this.nodes.splice(index, 0, cardNode);
  };

  public remove = (cardNode: CardNode) => {
    this.nodes = this.nodes.filter((c) => c !== cardNode);
  };

  public get = (index: number) => {
    return this.nodes[index];
  };

  public getCard = (index: number) => {
    return this.nodes[index].card.get();
  };

  public getCards = () => {
    return this.nodes.map((node) => node.card.get());
  };

  public indexOf = (card: Card) => {
    for (const [index, cardInList] of this.getCards().entries()) {
      if (isCardEqual(card, cardInList)) {
        return index;
      }
    }
    return -1;
  };

  public get length() {
    return this.nodes.length;
  }
}