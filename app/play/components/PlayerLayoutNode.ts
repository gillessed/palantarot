import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { getPlayerName } from "../../services/utils/playerName";
import { CardHeight, CardWidth } from "../constants/CardConstants";
import type { PlaySceneContext } from "../PlaySceneContext";
import { LoadedImageNode } from "./LoadedImageNode";
import { PlayerInfoNode, PlayerInfoNodeHeight, PlayerInfoNodeWidth } from "./PlayerInfoNode";

export type PlayerPosition =
  | "left"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom";

export const PlayerPositionLayout: Record<number, PlayerPosition[]> = {
  [1]: ["bottom"],
  [2]: ["bottom", "top-left"],
  [3]: ["bottom", "top-right", "top-left"],
  [4]: ["bottom", "left", "top", "right"],
  [5]: ["bottom", "left", "top-left", "top-right", "right"],
};

const TextPadding = 5;

export class PlayerLayoutNode extends TwoDNode<PlaySceneContext> {
  public playerPosition: PlayerPosition = "left";
  public cardNode: LoadedImageNode;
  public playEnterAnimation: boolean = false;
  public enterAnimationAxis: "x" | "y" = "x";
  public enterAnimation: AnimationNode<PlaySceneContext>;
  public textFadeInAnimation: AnimationNode<PlaySceneContext>;
  public playerInfoNode: PlayerInfoNode;

  public enterAnimationUpdated = (value: number) => {
    if (this.enterAnimationAxis === "x") {
      this.cardNode.offset[0] = value;
    } else {
      this.cardNode.offset[1] = value;
    }
  };

  public textFadeInAnimationUpdated = (value: number) => {
    this.playerInfoNode.opacity = value;
  };

  constructor(id: string) {
    super(id);

    this.cardNode = new LoadedImageNode(`${id}-card`, "CardBackBlack");
    this.cardNode.width = CardWidth;
    this.cardNode.height = CardHeight;
    this.addChild(this.cardNode);

    this.enterAnimation = new AnimationNode(`${id}-enter-animation`);
    this.enterAnimation.durationMs = 800;
    this.enterAnimation.easing = "inOutCubic";
    this.enterAnimation.startValue = 0;
    this.enterAnimation.endValue = 0;
    this.enterAnimation.updateListeners.add(this.enterAnimationUpdated);
    this.addChild(this.enterAnimation);

    this.textFadeInAnimation = new AnimationNode(`${id}-fade-in-animation`);
    this.textFadeInAnimation.durationMs = 800;
    this.textFadeInAnimation.easing = "inOutCubic";
    this.textFadeInAnimation.startValue = 0;
    this.textFadeInAnimation.endValue = 1;
    this.textFadeInAnimation.updateListeners.add(
      this.textFadeInAnimationUpdated
    );
    this.addChild(this.textFadeInAnimation);

    this.playerInfoNode = new PlayerInfoNode(`$${id}-checkmark`);
    this.playerInfoNode.offset[1] = -40;
    this.addChild(this.playerInfoNode);
  }

  public onMount = (container: NodeManager<PlaySceneContext>) => {
    const { players, playerId } = container.context;
    this.playerInfoNode.textNode.text = getPlayerName(players.get(playerId));
    if (this.playEnterAnimation) {
      this.enterAnimation.start();
      this.textFadeInAnimation.start();
    }
  };

  public setPlayerPosition = (playerPosition: PlayerPosition) => {
    this.playerPosition = playerPosition;
    switch (playerPosition) {
      case "left":
        this.playerInfoNode.offset = [10, -CardHeight / 2 - TextPadding - PlayerInfoNodeHeight];
        this.playerInfoNode.alignment = "right";
        this.enterAnimationAxis = "x";
        this.enterAnimation.startValue = -CardWidth / 2;
        break;
      case "top-left":
        this.playerInfoNode.offset = [-PlayerInfoNodeWidth / 2, CardHeight / 2 + TextPadding];
        this.playerInfoNode.alignment = "bottom";
        this.enterAnimationAxis = "y";
        this.enterAnimation.startValue = -CardHeight / 2;
        break;
      case "top":
        this.playerInfoNode.offset = [-PlayerInfoNodeWidth / 2, CardHeight / 2 + TextPadding];
        this.playerInfoNode.alignment = "bottom";
        this.enterAnimationAxis = "y";
        this.enterAnimation.startValue = -CardHeight / 2;
        break;
      case "top-right":
        this.playerInfoNode.offset = [-PlayerInfoNodeWidth / 2, CardHeight / 2 + TextPadding];
        this.playerInfoNode.alignment = "bottom";
        this.enterAnimationAxis = "y";
        this.enterAnimation.startValue = -CardHeight / 2;
        break;
      case "right":
        this.playerInfoNode.offset = [-10 - PlayerInfoNodeWidth, -CardHeight / 2 - TextPadding - PlayerInfoNodeHeight];
        this.playerInfoNode.alignment = "left";
        this.enterAnimationAxis = "x";
        this.enterAnimation.startValue = CardWidth / 2;
        break;
      case "bottom":
        this.playerInfoNode.offset = [-PlayerInfoNodeWidth / 2, -CardHeight / 2 - TextPadding - PlayerInfoNodeHeight];
        this.playerInfoNode.alignment = "top";
        this.enterAnimationAxis = "y";
        this.enterAnimation.startValue = CardHeight / 2;
        break;
    }
  };
}
