import { Call, type BidValue } from "../../../../server/play/model/GameState";
import { ModalNode } from "../../components/ModalNode";
import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import type { PlaySceneContext } from "../../PlaySceneContext";

const ButtonWidth = 80;
const ButtonPadding = 20;
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

  constructor(context: PlaySceneContext, id: string) {
    super(id);
    this.context = context;

    const buttonRowWidth = 3 * ButtonWidth + 2 * ButtonPadding;
    const modalWidth = buttonRowWidth + 2 * ModalPadding;
    const modalHeight = ButtonHeight * 3 + ButtonPadding * 2 + ModalPadding * 2;
    this.size.set({ width: modalWidth, height: modalHeight });

    // TODO: add text in front

    for (let i = 0; i < 3; i++) {
      const offsetX =
        -buttonRowWidth / 2 +
        i * (ButtonWidth + ButtonPadding) +
        ButtonWidth / 2;

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
      upperButton.offset[0] = offsetX;
      upperButton.offset[1] = upperOffset;
      upperButton.onClick = () => {
        this.context.eventHandler.bid(upperBid.value, upperBid.calls);
      };
      this.addChild(upperButton);

      const lowerBid = bids[i + 3];
      const lowerButton = new TextActionButtonNode(
        `${this.id}-bid-value-lower-${i}`
      );
      lowerButton.setText(lowerBid.text);
      lowerButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      lowerButton.offset[0] = offsetX;
      lowerButton.offset[1] = upperOffset + ButtonHeight + ButtonPadding;
      lowerButton.onClick = () => {
        this.context.eventHandler.bid(lowerBid.value, upperBid.calls);
      };
      this.addChild(lowerButton);
    }

    const passButton = new TextActionButtonNode(`${this.id}-bid-pass`);
    passButton.setText("PASS");
    passButton.size.set({
      width: ButtonWidth,
      height: ButtonHeight,
    });
    passButton.offset[1] =
      -modalHeight / 2 +
      ModalPadding +
      2 * (ButtonHeight + ButtonPadding) +
      ButtonHeight / 2;
    this.addChild(passButton);
  }
}
