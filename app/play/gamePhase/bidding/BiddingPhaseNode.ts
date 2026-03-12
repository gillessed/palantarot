import {
  DealtHandTransition,
  type BidAction,
  type PlayerEvent,
} from "../../../../server/play/model/GameEvents";
import {
  BidPass,
  type Bid,
  type PlayerId,
} from "../../../../server/play/model/GameState";
import type {
  BiddingClientGameState,
  ClientGameState,
} from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { BiddingPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import type { Animate } from "../../utils/Animate";
import type { GameEventHandler } from "../GameEventHandler";
import { BidModalNode } from "./BidModalNode";
import { PlayerBidNode } from "./PlayerBidNode";

export class BiddingPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public bidNodes: Map<PlayerId, PlayerBidNode> = new Map();
  public modalNode: BidModalNode;

  constructor(context: PlaySceneContext, state: BiddingClientGameState) {
    super(BiddingPhaseNodeId);
    this.context = context;

    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      state.hand
    );
    this.startedGameNode.setActivePlayer(
      state.playerOrder[state.toBid],
      "instant"
    );
    this.addChild(this.startedGameNode);

    for (const bid of state.playerBids.values()) {
      this.setBid(bid, "instant");
    }

    this.modalNode = new BidModalNode(this.context, `${this.id}-modal`);
    this.modalNode.visible =
      this.startedGameNode.activePlayerId === context.playerId;
    this.addChild(this.modalNode);
  }

  public handleEvent = async (event: PlayerEvent, gameState: ClientGameState) => {
    const { type } = event;
    switch (type) {
      case "dealt_hand":
        await this.handleDealtHands(event);
        break;

      case "bid":
        if (gameState.phase !== "bidding") {
          throw Error("Cannot be not in bid state here");
        }
        await this.handleBid(event, gameState.playerOrder[gameState.toBid]);
        break;
    }
  };

  public handleDealtHands = async (transition: DealtHandTransition) => {
    return this.startedGameNode.playerHandNode.dealHand(transition.hand, "animate");
  };

  public setBid = (bid: Bid, animate: Animate) => {
    const bidNodeId = `${this.id}-${bid.player}-bid`;
    const bidNode =
      this.container?.getNode<PlayerBidNode>(bidNodeId) ??
      new PlayerBidNode(bidNodeId);
    bidNode.setBid(bid, animate);
    const playerNode = this.startedGameNode.playerInfoNodes.playerInfoNodes.get(
      bid.player
    );
    if (playerNode != null) {
      const faded = bid.bid === BidPass;
      playerNode.fade(faded ? "fadeOut" : "fadeIn", animate);
      if (!bidNode.isMounted) {
        playerNode.addChild(bidNode);
      }
    }
  };

  public handleBid = async (action: BidAction, newActivePlayer: string) => {
    const bid: Bid = {
      player: action.playerId,
      bid: action.bid,
      calls: action.calls ?? [],
    };
    this.setBid(bid, "animate");

    if (newActivePlayer === this.context.playerId) {
      this.modalNode.fadeIn();
    } else if (this.startedGameNode.activePlayerId === this.context.playerId) {
      this.modalNode.fadeOut();
    }
    this.startedGameNode.setActivePlayer(newActivePlayer, "animate");
  };
}
