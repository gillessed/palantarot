import { PlayerId } from "../../../server/play/model/GameState";
import { v_set, v_sum, Vector } from "../../sceneGraph/math/Vector";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { CardHeight } from "../constants/CardConstants";
import { SidePlayerInfosNodeId } from "../NodeIds";
import { PlaySceneContext } from "../PlaySceneContext";
import {
  PlayerInfoNode,
  PlayerInfoNodeHeight,
  PlayerInfoNodeWidth,
} from "./PlayerInfoNode";
import { SideCardPosition, SideCardPositions } from "./SideCardNode";
import { SideCardPositionLayout } from "./SideCardsNode";

const Below = CardHeight / 2 + PlayerInfoNodeHeight / 2 + 10;
const Above = -Below;
const PushLeft = PlayerInfoNodeWidth / 2 + 10;
const PushRight = -PushLeft;

const InfoOffsets: { [K in SideCardPosition]: Vector } = {
  left: [PushLeft, Above],
  "top-left": [0, Below],
  top: [0, Below],
  "top-right": [0, Below],
  right: [PushRight, Above],
  bottom: [PushRight, Above],
};

function rotatePlayerOrder(
  playerOrder: ReadonlyArray<PlayerId>,
  playerId: string
) {
  const playerIndex = playerOrder.indexOf(playerId);
  if (playerIndex <= 0) {
    return [...playerOrder];
  } else {
    return [
      ...playerOrder.slice(playerIndex),
      ...playerOrder.slice(0, playerIndex),
    ];
  }
}

export class SidePlayerInfosNode extends TwoDNode {
  public context: PlaySceneContext;
  public playerInfoNodes = new Map<PlayerId, PlayerInfoNode>();

  constructor(context: PlaySceneContext, playerOrder: ReadonlyArray<PlayerId>) {
    super(SidePlayerInfosNodeId);
    this.context = context;

    const rotatedPlayers = rotatePlayerOrder(playerOrder, context.playerId);
    const layout = SideCardPositionLayout[rotatedPlayers.length];
    for (let i = 0; i < rotatedPlayers.length; i++) {
      const position = layout[i];
      this.addPlayerInfoNode(rotatedPlayers[i], position);
    }
  }

  private addPlayerInfoNode = (
    playerId: string,
    position: SideCardPosition
  ) => {
    const playerInfoNode = new PlayerInfoNode(
      this.context,
      `$${this.id}-${playerId}`
    );
    playerInfoNode.setPlayerId(playerId);
    playerInfoNode.visible = true;
    playerInfoNode.update = () => {
      const width = this.container?.width ?? 0;
      const height = this.container?.height ?? 0;
      const [cardOffset] = SideCardPositions[position](width / 2, height / 2);
      v_set(playerInfoNode.offset, cardOffset);
      v_sum(playerInfoNode.offset, InfoOffsets[position]);
    };
    this.playerInfoNodes.set(playerId, playerInfoNode);
    this.addChild(playerInfoNode);
  };
}
