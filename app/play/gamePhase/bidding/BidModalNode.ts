import { Call, type BidValue } from "../../../../server/play/model/GameState";
import {
  createLayoutNode,
  LayoutNode,
  SizeableNode,
} from "../../../sceneGraph/nodes/2d/LayoutNode";
import { ModalNode } from "../../components/ModalNode";
import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import type { PlaySceneContext } from "../../PlaySceneContext";

const ButtonWidth = 80;
const ButtonGap = 20;
const ButtonHeight = 50;
const ModalPadding = 50;

const bids: { text: string; value: BidValue; calls: Call[] }[] = [
  { text: "10", value: 10, calls: [] },
  { text: "20", value: 20, calls: [] },
  { text: "R 20", value: 20, calls: ["russian"] },
  { text: "40", value: 40, calls: [] },
  { text: "80", value: 80, calls: [] },
  { text: "160", value: 160, calls: [] },
];

export class BidModalNode extends ModalNode {
  public context: PlaySceneContext;
  public outerLayout: LayoutNode;

  constructor(context: PlaySceneContext, id: string) {
    super(id);
    this.context = context;

    const buttonRowWidth = 3 * ButtonWidth + 2 * ButtonGap;
    const modalWidth = buttonRowWidth + 2 * ModalPadding;
    const modalHeight = ButtonHeight * 3 + ButtonGap * 2 + ModalPadding * 2;
    this.size.set({ width: modalWidth, height: modalHeight });

    // TODO: add text in front

    const bidNodePairs: SizeableNode[] = [];
    for (let i = 0; i < 3; i++) {
      const offsetX =
        -buttonRowWidth / 2 + i * (ButtonWidth + ButtonGap) + ButtonWidth / 2;

      const upperBid = bids[i];
      const upperOffset = -modalHeight / 2 + ModalPadding + ButtonHeight / 2;
      const upperButton = new TextActionButtonNode(
        `${this.id}-bid-value-upper-${i}`
      );
      upperButton.setText(upperBid.text);
      upperButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      upperButton.onClick = () => {
        this.context.eventHandler.bid(upperBid.value, upperBid.calls);
      };

      const lowerBid = bids[i + 3];
      const lowerButton = new TextActionButtonNode(
        `${this.id}-bid-value-lower-${i}`
      );
      lowerButton.setText(lowerBid.text);
      lowerButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      lowerButton.onClick = () => {
        this.context.eventHandler.bid(lowerBid.value, upperBid.calls);
      };
      bidNodePairs.push(
        createLayoutNode({
          id: `${this.id}-bid-pair-${i}`,
          nodes: [upperButton, lowerButton],
          axis: "y",
          gap: ButtonGap,
        })
      );
    }

    const passButton = new TextActionButtonNode(`${this.id}-bid-pass`);
    passButton.setText("PASS");
    passButton.size.set({
      width: ButtonHeight * 2 + ButtonGap,
      height: ButtonHeight * 2 + ButtonGap,
    });
    const bidRowNode = createLayoutNode({
      id: `${this.id}-bid-button-row`,
      nodes: [...bidNodePairs, passButton],
      gap: ButtonGap,
    });
    this.outerLayout = createLayoutNode({
      id: `${this.id}-layout`,
      nodes: [bidRowNode],
      axis: "y",
      padding: ModalPadding,
    });
    this.addChild(this.outerLayout);
  }

  public onMount = () => {
    const removeListener = this.outerLayout.size.getAndListen((size) => {
      this.size.set(size);
    });
    return () => {
      removeListener();
    };
  };
}
