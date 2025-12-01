import type { DogRevealClientGameState } from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { DogRevealPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import type { Animate } from "../../utils/Animate";
import { DogCardsNode } from "./DogCardsNode";

export class DogRevealPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public dogCardsNode: DogCardsNode;

  constructor(context: PlaySceneContext, state: DogRevealClientGameState) {
    super(DogRevealPhaseNodeId);
    this.context = context;

    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      state.hand,
      state.winningBid
    );
    this.startedGameNode.setActivePlayer(state.winningBid.player, "instant");
    this.addChild(this.startedGameNode);

    this.dogCardsNode = new DogCardsNode(
      state.playerOrder.length === 5 ? 3 : 6
    );
    this.addChild(this.dogCardsNode);

    for (const card of state.dog) {
      this.dogCardsNode.addCard(card, "face-down");
    }
  }

  public reveal = (animate: Animate) => {
    this.dogCardsNode.turnOverAll("face-up", animate);
  };
}
