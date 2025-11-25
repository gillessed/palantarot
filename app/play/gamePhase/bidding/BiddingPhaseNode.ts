import {
  DealtHandTransition,
  type BidAction,
} from "../../../../server/play/model/GameEvents";
import {
  BidPass,
  type Bid,
  type PlayerId,
} from "../../../../server/play/model/GameState";
import type { BiddingClientGameState } from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerHandNode } from "../../components/PlayerHandNode";
import { SideCardsNode } from "../../components/SideCardsNode";
import { SidePlayerInfosNode } from "../../components/SidePlayerInfosNode";
import { BiddingPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { BidModalNode } from "./BidModalNode";
import { PlayerBidNode } from "./PlayerBidNode";

export class BiddingPhaseNode extends TwoDNode {
  public context: PlaySceneContext;
  public sideCardNodes: SideCardsNode;
  public playerInfoNodes: SidePlayerInfosNode;
  public bidNodes: Map<PlayerId, PlayerBidNode> = new Map();
  public playerHandNode: PlayerHandNode;
  public modalNode: BidModalNode;
  private playerInGame: boolean;
  private activePlayerId: string;

  constructor(context: PlaySceneContext, state: BiddingClientGameState) {
    super(BiddingPhaseNodeId);
    this.context = context;
    this.playerInGame = state.playerOrder.includes(context.playerId);

    this.sideCardNodes = new SideCardsNode(this.playerInGame);
    this.sideCardNodes.setCount(state.playerOrder.length);
    this.addChild(this.sideCardNodes);

    this.playerInfoNodes = new SidePlayerInfosNode(
      this.context,
      state.playerOrder
    );
    this.activePlayerId = state.playerOrder[state.toBid];
    this.playerInfoNodes.playerInfoNodes
      .get(this.activePlayerId)
      ?.setActive(true);
    this.addChild(this.playerInfoNodes);

    for (const bid of state.playerBids.values()) {
      this.setBid(bid, false);
    }

    this.playerHandNode = new PlayerHandNode(context, state.hand);
    this.addChild(this.playerHandNode);

    this.modalNode = new BidModalNode(this.context, `${this.id}-modal`);
    this.modalNode.visible = this.activePlayerId === context.playerId;
    this.addChild(this.modalNode);
  }

  public handleDealtHands = (transition: DealtHandTransition) => {
    this.playerHandNode.setHand(transition.hand, true);
  };

  public setBid = (bid: Bid, animate: boolean) => {
    const bidNodeId = `${this.id}-${bid.player}-bid`;
    const bidNode =
      this.container?.getNode<PlayerBidNode>(bidNodeId) ??
      new PlayerBidNode(bidNodeId);
    bidNode.setBid(bid, animate);
    const playerNode = this.playerInfoNodes.playerInfoNodes.get(bid.player);
    if (playerNode != null) {
      const faded = bid.bid === BidPass;
      if (animate) {
        playerNode.fade(faded ? "fadeOut" : "fadeIn");
      } else {
        playerNode.setFade(faded);
      }
      if (!bidNode.isMounted) {
        playerNode.addChild(bidNode);
      }
    }
  };

  public handleBid = (action: BidAction, newActivePlayer: string) => {
    const bid: Bid = {
      player: action.playerId,
      bid: action.bid,
      calls: action.calls ?? [],
    };
    this.setBid(bid, true);

    this.playerInfoNodes.playerInfoNodes
      .get(this.activePlayerId)
      ?.animateActive(false);
    this.playerInfoNodes.playerInfoNodes
      .get(newActivePlayer)
      ?.animateActive(true);
    if (newActivePlayer === this.context.playerId) {
      this.modalNode.fadeIn();
    } else if (this.activePlayerId === this.context.playerId) {
      this.modalNode.fadeOut();
    }
    this.activePlayerId = newActivePlayer;
  };
}
