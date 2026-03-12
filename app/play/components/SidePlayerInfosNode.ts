import { PlayerId } from "../../../server/play/model/GameState";
import { v_set, v_sum, Vector } from "../../sceneGraph/math/Vector";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { CardHeight } from "../constants/CardConstants";
import { SidePlayerInfosNodeId } from "../NodeIds";
import { PlaySceneContext } from "../PlaySceneContext";
import { rotatePlayerOrder } from "../utils/rotatePlayerOrder";
import {
  PlayerInfoNode,
  PlayerInfoNodeHeight,
  PlayerInfoNodeWidth,
} from "./PlayerInfoNode";
import { SideCardPosition, SideCardPositions } from "./SideCardNode";
import { SideCardPositionLayout } from "./SideCardsNode";

const Below = CardHeight / 2 + PlayerInfoNodeHeight / 2 + 15;
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
      `${this.id}-${playerId}`
    );
    playerInfoNode.setPlayerId(playerId);
    playerInfoNode.visible = true;
    playerInfoNode.onMount = (nodeManager: NodeManager) => {
      const removeListener = nodeManager.size.getAndListen((size) => {
        const [cardOffset] = SideCardPositions[position](
          size.width / 2,
          size.height / 2
        );
        v_set(playerInfoNode.offset, cardOffset);
        v_sum(playerInfoNode.offset, InfoOffsets[position]);
      });
      return () => {
        removeListener();
      };
    };
    this.playerInfoNodes.set(playerId, playerInfoNode);
    this.addChild(playerInfoNode);
  };
}
