import { PlayerId } from "../../../../server/play/model/GameState";
import { ClientTrick } from "../../../../shared/types/ClientGameTypes";
import { Vector } from "../../../sceneGraph/math/Vector";
import { RectNode } from "../../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { CardNode } from "../../components/CardNode";
import {
  AreaBackgroundPadding,
  CardHeight,
  CardWidth,
} from "../../constants/CardConstants";
import { PrimaryColor } from "../../constants/Themes";
import { TrickCardsPhaseNodeId } from "../../NodeIds";

export type TrickCardPosition =
  | "top"
  | "top-left"
  | "top-right"
  | "right"
  | "left"
  | "lower-left"
  | "lower-right"
  | "bottom"
  | "lower-bottom";

export function getTrickPositions(
  trickSize: number,
): readonly TrickCardPosition[] {
  if (trickSize === 3) {
    return ["bottom", "top-right", "top-left"];
  } else if (trickSize === 4) {
    return ["bottom", "right", "top", "left"];
  } else if (trickSize === 5) {
    return [
      "lower-bottom",
      "lower-right",
      "top-right",
      "top-left",
      "lower-left",
    ];
  } else {
    throw Error("Trick size must be with [3-5]: " + trickSize);
  }
}

const BackgroundWidth = CardWidth + 2 * AreaBackgroundPadding;
const BackgroundHeight = CardHeight + 2 * AreaBackgroundPadding;
const BackroundPadding = 10;

export const TrickCardOffsets: Record<TrickCardPosition, Vector> = {
  bottom: [0, BackgroundHeight / 2],
  top: [0, -BackgroundHeight / 2 - BackroundPadding],
  "top-left": [
    -BackgroundWidth / 2 - BackroundPadding / 2,
    -BackgroundHeight / 2 - BackroundPadding,
  ],
  "top-right": [
    BackgroundWidth / 2 + BackroundPadding / 2,
    -BackgroundHeight / 2 - BackroundPadding,
  ],
  left: [-BackgroundWidth / 2 - BackroundPadding, 0],
  right: [BackgroundWidth / 2 + BackroundPadding, 0],
  "lower-bottom": [0, BackgroundHeight / 2 + 60],
  "lower-left": [-BackgroundWidth - BackroundPadding, BackgroundHeight / 2],
  "lower-right": [BackgroundWidth + BackroundPadding, BackgroundHeight / 2],
};

export class TrickCardsNode extends TwoDNode {
  public playerOrder: readonly PlayerId[];
  public cardNodes = new Map<PlayerId, CardNode>();
  public cardNodeOrder: PlayerId[] = [];
  public trickPositions: ReadonlyMap<PlayerId, TrickCardPosition>;

  constructor(playerOrder: readonly PlayerId[], currentTrick: ClientTrick) {
    super(TrickCardsPhaseNodeId);
    this.playerOrder = playerOrder;
    this.offset[1] = -50;
    const positionArray = getTrickPositions(playerOrder.length);
    const trickPositions = new Map<PlayerId, TrickCardPosition>();
    for (let i = 0; i < playerOrder.length; i++) {
      const player = playerOrder[i];
      const position = positionArray[i];
      trickPositions.set(player, position);
    }
    this.trickPositions = trickPositions;

    for (const playerId of this.playerOrder) {
      const position = this.trickPositions.get(playerId);
      if (position == null) {
        throw Error("Should have a position for each player");
      }
      const backgroundNode = new RectNode(`${this.id}-background-${position}`);
      backgroundNode.setTheme({
        backgroundColor: PrimaryColor[5],
        borderRadius: 5,
      });
      backgroundNode.size.set({
        width: CardWidth + 2 * AreaBackgroundPadding,
        height: CardHeight + 2 * AreaBackgroundPadding,
      });
      backgroundNode.offset = TrickCardOffsets[position];
      this.addChild(backgroundNode);
    }

    for (const playerId of currentTrick.order) {
      const position = this.trickPositions.get(playerId);
      const card = currentTrick.cards.get(playerId);
      if (card == null || position == null) {
        throw Error("card and position should not be null");
      }
      const cardNode = new CardNode(`${this.id}-card-${position}`);
      cardNode.offset = TrickCardOffsets[position];
      cardNode.card.set(card);
      this.cardNodes.set(playerId, cardNode);
      this.addChild(cardNode);
    }
  }

  public getOffsetForPlayer = (playerId: PlayerId) => {
    const position = this.trickPositions.get(playerId);
    if (position == null) {
      throw Error("Cannot find offset for player not in game");
    }
    return TrickCardOffsets[position];
  };
}
