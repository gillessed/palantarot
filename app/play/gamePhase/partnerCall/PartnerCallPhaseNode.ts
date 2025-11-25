import type { PartnerCallClientGameState } from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerHandNode } from "../../components/PlayerHandNode";
import { SideCardsNode } from "../../components/SideCardsNode";
import { SidePlayerInfosNode } from "../../components/SidePlayerInfosNode";
import { PartnerCallPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { PlayerBidNode } from "../bidding/PlayerBidNode";
import { PartnerCallModalNode } from "./PartnerCallModalNode";

export class PartnerCallPhaseNode extends TwoDNode {
  public context: PlaySceneContext;
  public sideCardNodes: SideCardsNode;
  public playerInfoNodes: SidePlayerInfosNode;
  public bidNode: PlayerBidNode;
  public playerHandNode: PlayerHandNode;
  public modalNode: PartnerCallModalNode;
  private playerInGame: boolean;
  private activePlayerId: string;

  constructor(context: PlaySceneContext, state: PartnerCallClientGameState) {
    super(PartnerCallPhaseNodeId);
    this.context = context;
    this.playerInGame = state.playerOrder.includes(context.playerId);

    this.sideCardNodes = new SideCardsNode(this.playerInGame);
    this.sideCardNodes.setCount(state.playerOrder.length);
    this.addChild(this.sideCardNodes);

    this.playerInfoNodes = new SidePlayerInfosNode(
      this.context,
      state.playerOrder
    );
    this.activePlayerId = state.winningBid?.player;
    this.playerInfoNodes.playerInfoNodes
      .get(this.activePlayerId)
      ?.setActive(true);
    this.addChild(this.playerInfoNodes);

    this.bidNode = new PlayerBidNode(`${this.id}-${this.activePlayerId}-bid`);
    this.bidNode.setBid(state.winningBid, false);
    this.playerInfoNodes.playerInfoNodes
      .get(this.activePlayerId)
      ?.addChild(this.bidNode);

    this.playerHandNode = new PlayerHandNode(context, state.hand);
    this.addChild(this.playerHandNode);

    this.modalNode = new PartnerCallModalNode(this.context, state.hand);
    this.modalNode.visible = this.activePlayerId === context.playerId;
    this.addChild(this.modalNode);
  }
}
