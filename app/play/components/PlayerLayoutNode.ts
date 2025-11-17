import type { SvgNode } from "../../sceneGraph/nodes/2d/SvgNode";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import type { TextTheme } from "../../sceneGraph/scene/Theme";
import { getPlayerName } from "../../services/utils/playerName";
import { CardHeight, CardWidth } from "../constants/CardConstants";
import type { PlaySceneContext } from "../PlaySceneContext";
import { CheckmarkNode } from "./CheckmarkNode";
import { LoadedImageNode } from "./LoadedImageNode";

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

const PlayerNodeTextTheme: TextTheme = {
  fontFamily: "blenderProBold",
  fontSize: 32,
  textBorderColor: "white",
  textColor: "black",
};

export class PlayerLayoutNode extends TwoDNode<PlaySceneContext> {
  public playerPosition: PlayerPosition = "left";
  public textNode: TextNode<PlaySceneContext>;
  public cardNode: LoadedImageNode;
  public playEnterAnimation: boolean = false;
  public enterAnimationAxis: "x" | "y" = "x";
  public enterAnimation: AnimationNode<PlaySceneContext>;
  public textFadeInAnimation: AnimationNode<PlaySceneContext>;
  public checkmarkNode: CheckmarkNode;

  public enterAnimationUpdated = (value: number) => {
    if (this.enterAnimationAxis === "x") {
      this.cardNode.offset[0] = value;
    } else {
      this.cardNode.offset[1] = value;
    }
  };

  public textFadeInAnimationUpdated = (value: number) => {
    this.textNode.opacity = value;
  };

  constructor(id: string) {
    super(id);

    this.cardNode = new LoadedImageNode(`${id}-card`, "CardBackBlack");
    this.cardNode.width = CardWidth;
    this.cardNode.height = CardHeight;
    this.addChild(this.cardNode);

    this.textNode = new TextNode(`${id}-text`);
    this.textNode.theme = PlayerNodeTextTheme;
    this.addChild(this.textNode);

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

    this.checkmarkNode = new CheckmarkNode(`$${id}-checkmark`);
    this.checkmarkNode.offset[1] = -40;
    this.addChild(this.checkmarkNode);
  }

  public onMount = (container: NodeManager<PlaySceneContext>) => {
    const { players, playerId } = container.context;
    this.textNode.text = getPlayerName(players.get(playerId));
    if (this.playEnterAnimation) {
      this.enterAnimation.start();
      this.textFadeInAnimation.start();
    }
  };

  public setPlayerPosition = (playerPosition: PlayerPosition) => {
    this.playerPosition = playerPosition;
    switch (playerPosition) {
      case "left":
        this.textNode.textAlign = "left";
        this.textNode.textBaseline = "bottom";
        this.textNode.offset = [10, -CardHeight / 2 - TextPadding];
        this.enterAnimationAxis = "x";
        break;
      case "top-left":
        this.textNode.textAlign = "center";
        this.textNode.textBaseline = "top";
        this.textNode.offset = [0, CardHeight / 2 + TextPadding];
        this.enterAnimationAxis = "y";
        break;
      case "top":
        this.textNode.textAlign = "center";
        this.textNode.textBaseline = "top";
        this.textNode.offset = [0, CardHeight / 2 + TextPadding];
        this.enterAnimationAxis = "y";
        break;
      case "top-right":
        this.textNode.textAlign = "center";
        this.textNode.textBaseline = "top";
        this.textNode.offset = [0, CardHeight / 2 + TextPadding];
        this.enterAnimationAxis = "y";
        break;
      case "right":
        this.textNode.textAlign = "right";
        this.textNode.textBaseline = "bottom";
        this.textNode.offset = [-10, -CardHeight / 2 - TextPadding];
        this.enterAnimationAxis = "x";
        break;
      case "bottom":
        this.textNode.textAlign = "center";
        this.textNode.textBaseline = "bottom";
        this.textNode.offset = [0, -CardHeight / 2 - TextPadding];
        this.enterAnimationAxis = "y";
        this.enterAnimation.startValue = CardHeight / 2;
        break;
    }
  };
}
