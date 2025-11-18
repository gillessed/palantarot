import type { ClientGame } from "../../../../shared/types/ClientGameTypes";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { NewGameNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";

export class BiddingPhaseNode extends TwoDNode<PlaySceneContext> {
  constructor() {
    super(NewGameNodeId);
  }

  public setToGameState = (state: ClientGame) => {
    if (state.gamePhase !== "bidding") {
      throw Error("Updating new game node with not new game state");
    }
    const playerId = this.container?.context.playerId!;
    // TODO: update state
  };
}
