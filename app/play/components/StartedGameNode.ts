import type { Card } from "../../../server/play/model/Card";
import type { Bid, PlayerId } from "../../../server/play/model/GameState";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerBidNode } from "../gamePhase/bidding/PlayerBidNode";
import { StartedGameNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import type { Animate } from "../utils/Animate";
import { PlayerHandNode } from "./PlayerHandNode";
import { SideCardsNode } from "./SideCardsNode";
import { SidePlayerInfosNode } from "./SidePlayerInfosNode";

export class StartedGameNode extends TwoDNode {
  public context: PlaySceneContext;
  public sideCardNodes: SideCardsNode;
  public playerInfoNodes: SidePlayerInfosNode;
  public playerHandNode: PlayerHandNode;
  public playerInGame: boolean;
  public activePlayerId?: string;

  constructor(
    context: PlaySceneContext,
    playerOrder: ReadonlyArray<PlayerId>,
    hand: ReadonlyArray<Card>,
    winningBid?: Bid
  ) {
    super(StartedGameNodeId);
    this.context = context;
    this.playerInGame = playerOrder.includes(context.playerId);

    this.sideCardNodes = new SideCardsNode(this.playerInGame);
    this.sideCardNodes.setCount(playerOrder.length);
    this.addChild(this.sideCardNodes);

    this.playerInfoNodes = new SidePlayerInfosNode(this.context, playerOrder);
    this.addChild(this.playerInfoNodes);

    this.playerHandNode = new PlayerHandNode(context, hand);
    this.addChild(this.playerHandNode);

    if (winningBid != null) {
      const bidNode = new PlayerBidNode(`${this.id}-winning-bid`);
      bidNode.setBid(winningBid, "instant");
      this.playerInfoNodes.playerInfoNodes
        .get(winningBid.player)
        ?.addChild(bidNode);
    }
  }

  public setActivePlayer = (
    playerId: PlayerId | undefined,
    animate: Animate
  ) => {
    if (this.activePlayerId === playerId) {
      return;
    }
    if (this.activePlayerId != null) {
      this.playerInfoNodes.playerInfoNodes
        .get(this.activePlayerId)
        ?.setActive(false, animate);
    }
    this.activePlayerId = playerId;
    if (this.activePlayerId != null) {
      this.playerInfoNodes.playerInfoNodes
        .get(this.activePlayerId)
        ?.setActive(true, animate);
    }
  };
}
