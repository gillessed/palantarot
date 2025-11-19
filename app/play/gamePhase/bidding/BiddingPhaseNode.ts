import { DealtHandTransition } from "../../../../server/play/model/GameEvents";
import type { ClientGame } from "../../../../shared/types/ClientGameTypes";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerHandNode } from "../../components/PlayerHandNode";
import { SideCardsNode } from "../../components/SideCardsNode";
import { SidePlayerInfosNode } from "../../components/SidePlayerInfosNode";
import { BiddingPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";

export class BiddingPhaseNode extends TwoDNode {
  public context: PlaySceneContext;
  public sideCardNodes: SideCardsNode;
  public playerInfoNodes: SidePlayerInfosNode;
  public playerHandNode: PlayerHandNode;
  private playerInGame: boolean;

  constructor(context: PlaySceneContext, state: ClientGame) {
    super(BiddingPhaseNodeId);
    if (state.gamePhase !== "bidding") {
      throw Error("Updating new game node with not new game state");
    }
    this.context = context;
    this.playerInGame = state.playerOrder.includes(context.playerId);

    this.sideCardNodes = new SideCardsNode(this.playerInGame);
    this.sideCardNodes.setCount(state.playerOrder.length);
    this.addChild(this.sideCardNodes);

    this.playerInfoNodes = new SidePlayerInfosNode(this.context, state.playerOrder);
    this.addChild(this.playerInfoNodes);

    this.playerHandNode = new PlayerHandNode(context, state.hand);
    this.addChild(this.playerHandNode);
  }

  public handleDealtHands = (transition: DealtHandTransition) => {
    
  }
}
