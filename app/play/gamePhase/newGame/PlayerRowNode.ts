import type { PlayerId } from "../../../../server/play/model/GameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerInfoNode } from "../../components/PlayerInfoNode";
import type { PlaySceneContext } from "../../PlaySceneContext";
import type { Animate } from "../../utils/Animate";
import { ReadyButton } from "./ReadyButton";

export const PlayerNodeWidth = 300;
export const PlayerRowHeight = 60;

export class PlayerRowNode extends TwoDNode {
  public context: PlaySceneContext;
  private playerInfoNode: PlayerInfoNode;
  private readyButton: ReadyButton;

  constructor(context: PlaySceneContext, id: string, playerId: PlayerId) {
    super(id);
    this.context = context;

    this.playerInfoNode = new PlayerInfoNode(context, `${id}-info`);
    this.playerInfoNode.setPlayerId(playerId);
    this.playerInfoNode.readyNode.visible = true;
    this.playerInfoNode.fade("fadeIn", "instant");
    this.addChild(this.playerInfoNode);

    this.readyButton = new ReadyButton(context);
    if (playerId === this.context.playerId) {
      this.playerInfoNode.addChild(this.readyButton);
    }
  }

  public setReady = (ready: boolean, animate: Animate) => {
    this.playerInfoNode.readyNode.setReady(ready, animate);
    this.readyButton.setReady(ready);
  };
}
