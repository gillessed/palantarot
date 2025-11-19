import type { PlayerId } from "../../../server/play/model/GameState";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { TextTheme } from "../../sceneGraph/scene/Theme";
import { getPlayerName } from "../../services/utils/playerName";
import type { PlaySceneContext } from "../PlaySceneContext";
import { pathRoundedRectangle } from "../utils/pathRoundedRectangle";
import { PlayerNodeBorderColor } from "./PlayerNodeConstants";
import { PlayerReadyNode } from "./PlayerReadyNode";

const PlayerNodeTextTheme: TextTheme = {
  fontFamily: "blenderProBold",
  fontSize: 24,
  textColor: "white",
};

export type PlayerReadyNodeAlignment = "left" | "right" | "top" | "bottom";
export const PlayerInfoNodeWidth = 300;
export const PlayerInfoNodeHeight = 60;
const TextWidth = 200;
const BackgroundColor = "#696c70";
const BorderColor = PlayerNodeBorderColor;
const BorderRadius = 10;
const OtherGradientColor = "#495057";
const SelfGradientColor = "#1971c2";

export class PlayerInfoNode extends TwoDNode {
  public context: PlaySceneContext;
  private playerId?: PlayerId;
  public textNode: TextNode;
  public readyNode: PlayerReadyNode;

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
  }

  public setPlayerId = (playerId: string | undefined) => {
    this.playerId = playerId;
    this.updateText();
  };

  public getPlayerId = () => this.playerId;

  private updateText = () => {
    if (this.playerId == null) {
      this.textNode.text = "";
    } else {
      this.textNode.text = getPlayerName(this.context.players.get(this.playerId));
    }
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = BackgroundColor;
    ctx.strokeStyle = BorderColor;
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
    const isSelf = this.playerId === this.context.playerId;

    ctx.save();
    const gradient = ctx.createLinearGradient(
      -PlayerInfoNodeWidth / 2 + TextWidth - 150,
      0,
      -PlayerInfoNodeWidth / 2 + TextWidth,
      0
    );
    gradient.addColorStop(0, isSelf ? SelfGradientColor : OtherGradientColor);
    gradient.addColorStop(1, BackgroundColor);
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
