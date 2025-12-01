import { BidPass, type Bid } from "../../../../server/play/model/GameState";
import { RectNode } from "../../../sceneGraph/nodes/2d/RectNode";
import { TextNode } from "../../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { TimerNode } from "../../../sceneGraph/nodes/TimerNode";
import {
  BidNodeWidth,
  PlayerInfoNodeHeight,
  PlayerInfoNodeWidth,
} from "../../components/PlayerInfoNode";
import type { Animate } from "../../utils/Animate";
import {
  PlayerBidNodeBackgroundTheme,
  PlayerBidNodeTextTheme,
} from "./PlayerBidNodeTheme";

export class PlayerBidNode extends TwoDNode {
  public bidNode: TextNode;
  public bidBackgroundNode: RectNode;
  public animation: TimerNode;

  constructor(id: string) {
    super(id);

    this.offset = [PlayerInfoNodeWidth / 2 - BidNodeWidth / 2 - 10, 0];

    this.bidNode = new TextNode(`${id}-bid`);
    this.bidNode.theme = PlayerBidNodeTextTheme;

    this.bidBackgroundNode = new RectNode(`${id}-bid-background`);
    this.bidBackgroundNode.size.set({
      width: BidNodeWidth,
      height: PlayerInfoNodeHeight - 20,
    });
    this.bidBackgroundNode.theme = PlayerBidNodeBackgroundTheme;
    this.bidBackgroundNode.visible = false;
    this.bidBackgroundNode.scale = [0, 0];
    this.bidBackgroundNode.addChild(this.bidNode);
    this.addChild(this.bidBackgroundNode);

    this.animation = new TimerNode(`${id}-animation`);
    this.animation.easing = "easeOutBounce";
    this.animation.durationMs = 800;
    this.addChild(this.animation);
  }

  public setBid = (bid: Bid | undefined, animate: Animate) => {
    if (bid == null) {
      this.bidNode.text = "";
    } else {
      const russianTwenty = bid.bid === 20 && bid.calls.includes("russian");
      const bidText =
        bid.bid === BidPass ? "PASS" : russianTwenty ? "R 20" : `${bid.bid}`;
      this.bidNode.text = bidText;
      // TODO: different color for pass vs number
      if (animate === "animate") {
        this.doBidEffect();
      } else {
        this.bidBackgroundNode.scale = [1, 1];
      }
    }
    this.bidBackgroundNode.visible = bid != null;
  };

  private doBidEffect = () => {
    this.animation.start({
      onChanged: (value: number) => {
        this.bidBackgroundNode.scale = [value, value];
      },
      onFinished: () => {
        this.bidBackgroundNode.scale = [1, 1];
      },
    });
  };
}
