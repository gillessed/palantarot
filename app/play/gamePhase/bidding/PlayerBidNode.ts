import { BidPass, type Bid } from "../../../../server/play/model/GameState";
import { RectNode } from "../../../sceneGraph/nodes/2d/RectNode";
import { TextNode } from "../../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { AnimationNode } from "../../../sceneGraph/nodes/AnimationNode";
import {
  BidNodeWidth,
  PlayerInfoNodeHeight,
  PlayerInfoNodeWidth,
} from "../../components/PlayerInfoNode";
import {
  PlayerBidNodeBackgroundTheme,
  PlayerBidNodeTextTheme,
} from "./PlayerBidNodeTheme";

export class PlayerBidNode extends TwoDNode {
  public bidNode: TextNode;
  public bidBackgroundNode: RectNode;
  public animation: AnimationNode;

  constructor(id: string) {
    super(id);

    this.offset = [PlayerInfoNodeWidth / 2 - BidNodeWidth / 2 - 10, 0];

    this.bidNode = new TextNode(`${id}-bid`);
    this.bidNode.theme = PlayerBidNodeTextTheme;

    this.bidBackgroundNode = new RectNode(`${id}-bid-background`);
    this.bidBackgroundNode.width = BidNodeWidth;
    this.bidBackgroundNode.height = PlayerInfoNodeHeight - 20;
    this.bidBackgroundNode.theme = PlayerBidNodeBackgroundTheme;
    this.bidBackgroundNode.visible = false;
    this.bidBackgroundNode.addChild(this.bidNode);
    this.addChild(this.bidBackgroundNode);

    this.animation = new AnimationNode(`${id}-animation`);
    this.animation.easing = "easeOutBounce";
    this.animation.durationMs = 800;
    this.animation.updateListeners.add((value: number) => {
      this.bidBackgroundNode.scale = [value, value];
    });
    this.animation.finishListeners.add(() => {
      this.bidBackgroundNode.scale = [1, 1];
    });
    this.addChild(this.animation);
  }

  public setBid = (bid: Bid | undefined, animate: boolean) => {
    if (bid == null) {
      this.bidNode.text = "";
    } else {
      const russianTwenty = bid.bid === 20 && bid.calls.includes("russian");
      const bidText =
        bid.bid === BidPass ? "PASS" : russianTwenty ? "R 20" : `${bid.bid}`;
      this.bidNode.text = bidText;
      // TODO: different color for pass vs number
      if (bid.bid === BidPass) {
        // TODO: animate this opacity change
        this.opacity = 0.5;
      } else {
        this.opacity = 1;
      }
      if (animate) {
        this.doBidEffect();
      }
    }
    this.bidBackgroundNode.visible = bid != null;
  };

  private doBidEffect = () => {
    this.animation.start();
  };
}
