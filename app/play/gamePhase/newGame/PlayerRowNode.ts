import type { PlayerId } from "../../../../server/play/model/GameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../../sceneGraph/nodes/SceneNode";
import { PlayerInfoNode } from "../../components/PlayerInfoNode";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { ReadyButton } from "./ReadyButton";

export const PlayerNodeWidth = 300;
export const PlayerRowHeight = 60;

export class PlayerRowNode extends TwoDNode<PlaySceneContext> {
  private playerInfoNode: PlayerInfoNode;
  private readyButton: ReadyButton = new ReadyButton();

  constructor(id: string, playerId: PlayerId) {
    super(id);

    this.playerInfoNode = new PlayerInfoNode(`${id}-info`);
    this.playerInfoNode.setPlayerId(playerId);
    this.addChild(this.playerInfoNode);
  }

  public setReady = (ready: boolean) => {
    this.playerInfoNode.readyNode.setReady(ready);
    this.readyButton.setReady(ready);
  };

  public animateReady = (ready: boolean) => {
    this.playerInfoNode.readyNode.animateReady(ready);
    this.readyButton.setReady(ready);
  };

  public onMount = (context: NodeManager<PlaySceneContext>) => {
    if (this.playerInfoNode.getPlayerId() === context.context.playerId) {
      this.addChild(this.readyButton);
    }
  };
}
