import type { Bid, PlayerId } from "../../../server/play/model/GameState";
import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { TextTheme } from "../../sceneGraph/scene/Theme";
import { getPlayerName } from "../../services/utils/playerName";
import { PrimaryColor } from "../constants/Themes";
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
const BackgroundColor = PrimaryColor[6];
const BorderColor = PlayerNodeBorderColor;
const BorderRadius = 10;

export class PlayerInfoNode extends TwoDNode {
  public context: PlaySceneContext;
  public textNode: TextNode;
  public readyNode: PlayerReadyNode;
  public bidNode: TextNode;
  public bidBackgroundNode: RectNode;
  private playerId?: PlayerId;

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

    this.bidNode = new TextNode(`${id}-bid`);

    this.bidBackgroundNode = new RectNode(`${id}-bid-background`);
    this.bidBackgroundNode.offset = [
      PlayerInfoNodeWidth - 100,
      PlayerInfoNodeHeight / 2,
    ];
    this.bidBackgroundNode.addChild(this.bidNode);
    this.addChild(this.bidBackgroundNode);

    this.readyNode = new PlayerReadyNode(`${id}-ready`);
    this.readyNode.offset = [PlayerInfoNodeWidth / 2, 0];
    this.readyNode.visible = false;
    this.addChild(this.readyNode);
  }

  public setBid = (bid: Bid | undefined) => {
    if (bid == null) {
      this.bidNode.text = "";
    } else {
      const russianTwenty = bid.bid === 20 && bid.calls.includes("russian")
      const bidText = bid.bid === 0 ? "PASS" : russianTwenty ? "R 20" : `${bid}`;
      this.bidNode.text = bidText;
      // TODO: different color for pass vs number
      // TODO: animate a bid thing to make it more visible
    }
    this.bidBackgroundNode.visible = bid != null;
  };

  public setPlayerId = (playerId: string | undefined) => {
    this.playerId = playerId;
    this.updateText();
  };

  public getPlayerId = () => this.playerId;

  private updateText = () => {
    if (this.playerId == null) {
      this.textNode.text = "";
    } else {
      this.textNode.text = getPlayerName(
        this.context.players.get(this.playerId)
      );
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
    ctx.save();
    const gradient = ctx.createLinearGradient(
      -PlayerInfoNodeWidth / 2 + TextWidth - 150,
      0,
      -PlayerInfoNodeWidth / 2 + TextWidth,
      0
    );
    gradient.addColorStop(0, BorderColor);
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
