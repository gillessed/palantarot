import type { PlayerEvent } from "../../../../server/play/model/GameEvents";
import type { PartnerCallClientGameState } from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { PartnerCallPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import type { GameEventHandler } from "../GameEventHandler";
import { PartnerCallModalNode } from "./PartnerCallModalNode";

export class PartnerCallPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public modalNode: PartnerCallModalNode;

  constructor(
    context: PlaySceneContext,
    state: PartnerCallClientGameState,
  ) {
    super(PartnerCallPhaseNodeId);
    this.context = context;

    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      state.hand,
      state.winningBid,
    );
    this.startedGameNode.setActivePlayer(state.winningBid.player, "instant");
    this.addChild(this.startedGameNode);

    this.modalNode = new PartnerCallModalNode(this.context, state.hand);
    if (this.startedGameNode.activePlayerId === context.playerId) {
      this.modalNode.fadeIn();
    }
    this.addChild(this.modalNode);
  }

  public handleEvent = async (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
      case "call_partner":
        // TODO: set partner in info box
        break;
    }
  };
}
