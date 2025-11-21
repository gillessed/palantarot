import { type PlayerId } from "../../../server/play/model/GameState";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../sceneGraph/nodes/AnimationNode";
import { TextTheme } from "../../sceneGraph/scene/Theme";
import { getPlayerName } from "../../services/utils/playerName";
import { interpolateColorString } from "../constants/PlayColors";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";
import {
  PlayerNodeActiveColors,
  PlayerNodeColors,
} from "./PlayerNodeConstants";
import { PlayerReadyNode } from "./PlayerReadyNode";

const PlayerNodeTextTheme: TextTheme = {
  fontFamily: "blenderProBold",
  fontSize: 24,
  textColor: "white",
};

export const BidNodeWidth = 80;
export type PlayerReadyNodeAlignment = "left" | "right" | "top" | "bottom";
export const PlayerInfoNodeWidth = 300;
export const PlayerInfoNodeHeight = 60;
const TextWidth = 200;
const BorderRadius = 10;

export class PlayerInfoNode extends TwoDNode {
  public context: PlaySceneContext;
  public textNode: TextNode;
  public readyNode: PlayerReadyNode;
  public activeAnimation: AnimationNode;
  public fadeAnimation: AnimationNode;
  private playerId?: PlayerId;
  private colorInterpolateValue = 0;

  constructor(context: PlaySceneContext, id: string) {
    super(id);
    this.context = context;

    this.textNode = new TextNode(`${id}-text`);
    this.textNode.textBaseline = "top";
    this.textNode.textAlign = "left";
    this.textNode.offset = [
      -PlayerInfoNodeWidth / 2 + 5,
      -PlayerInfoNodeHeight / 2 + 5,
    ];
    this.textNode.maxWidth = TextWidth;
    this.textNode.theme = PlayerNodeTextTheme;
    this.addChild(this.textNode);

    this.readyNode = new PlayerReadyNode(`${id}-ready`);
    this.readyNode.offset = [PlayerInfoNodeWidth / 2, 0];
    this.readyNode.visible = false;
    this.addChild(this.readyNode);

    this.activeAnimation = new AnimationNode(`${id}-active-animation`);
    this.activeAnimation.startValue = 0;
    this.activeAnimation.endValue = 1;
    this.activeAnimation.durationMs = 300;
    this.activeAnimation.easing = "inOutCubic";
    this.activeAnimation.updateListeners.add((value: number) => {
      this.colorInterpolateValue = value;
    });
    this.addChild(this.activeAnimation);

    this.fadeAnimation = new AnimationNode(`${id}-opacity-animation`);
    this.fadeAnimation.durationMs = 300;
    this.fadeAnimation.easing = "inOutCubic";
    this.fadeAnimation.updateListeners.add((value: number) => {
      this.opacity = value;
    });
    this.fadeAnimation.finishListeners.add(() => {
      this.opacity = this.fadeAnimation.endValue;
    });
    this.addChild(this.fadeAnimation);
  }

  public setPlayerId = (playerId: string | undefined) => {
    this.playerId = playerId;
    this.updateText();
  };

  public getPlayerId = () => this.playerId;

  public setActive = (active: boolean) => {
    this.colorInterpolateValue = active ? 1 : 0;
  };

  public animateActive = (active: boolean) => {
    this.activeAnimation.startValue = active ? 0 : 1;
    this.activeAnimation.endValue = active ? 1 : 0;
    this.activeAnimation.start();
  };

  public setFade = (faded: boolean) => {
    this.opacity = faded ? 0.6 : 1;
  };

  public fade = (mode: "fadeIn" | "fadeOut") => {
    this.fadeAnimation.startValue = mode === "fadeIn" ? 0.6 : 1;
    this.fadeAnimation.endValue = mode === "fadeIn" ? 1 : 0.6;
    this.fadeAnimation.start();
  };

  private updateText = () => {
    if (this.playerId == null) {
      this.textNode.text = "";
    } else {
      this.textNode.text = getPlayerName(
        this.context.players.get(this.playerId)
      );
    }
  };

  public getBackgroundColor = () => {
    return interpolateColorString(
      PlayerNodeColors.BackgroundColor,
      PlayerNodeActiveColors.BackgroundColor,
      this.colorInterpolateValue
    );
  };

  public getBorderColor = () => {
    return interpolateColorString(
      PlayerNodeColors.BorderColor,
      PlayerNodeActiveColors.BorderColor,
      this.colorInterpolateValue
    );
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = this.getBackgroundColor();
    ctx.strokeStyle = this.getBorderColor();
    ctx.lineWidth = 3;

    const rectPath = new Path2D();
    pathRoundedRectangle(
      rectPath,
      this.position[0] - PlayerInfoNodeWidth / 2,
      this.position[1] - PlayerInfoNodeHeight / 2,
      PlayerInfoNodeWidth,
      PlayerInfoNodeHeight,
      BorderRadius
    );
    ctx.save();
    ctx.fill(rectPath);
    ctx.restore();

    this.renderNameHighlight(ctx);

    ctx.stroke(rectPath);
  };

  private renderNameHighlight = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const gradient = ctx.createLinearGradient(
      -PlayerInfoNodeWidth / 2 + TextWidth - 150,
      0,
      -PlayerInfoNodeWidth / 2 + TextWidth,
      0
    );
    gradient.addColorStop(0, this.getBorderColor());
    gradient.addColorStop(1, this.getBackgroundColor());
    ctx.fillStyle = gradient;
    const rectPath = new Path2D();
    pathRoundedRectangle(
      rectPath,
      -PlayerInfoNodeWidth / 2,
      -PlayerInfoNodeHeight / 2,
      TextWidth,
      32,
      BorderRadius,
      [false, false, false, true]
    );
    ctx.fill(rectPath);
    ctx.restore();
  };
}
