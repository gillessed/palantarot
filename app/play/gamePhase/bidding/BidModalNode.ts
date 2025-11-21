import { Call } from "../../../../server/play/model/GameState";
import { ActionButtonNode } from "../../components/ActionButtonNode";
import { ModalNode } from "../../components/ModalNode";

const ButtonWidth = 80;
const ButtonPadding = 20;
const ButtonHeight = 50;
const ModalPadding = 50;

const bids: { text: string; value: number; calls: Call[] }[] = [
  { text: "10", value: 10, calls: [] },
  { text: "20", value: 20, calls: [] },
  { text: "R 20", value: 20, calls: ["russian"] },
  { text: "40", value: 40, calls: [] },
  { text: "80", value: 80, calls: [] },
  { text: "160", value: 160, calls: [] },
];

export class BidModalNode extends ModalNode {
  constructor(id: string, ) {
    super(id);
    const buttonRowWidth = 3 * ButtonWidth + 2 * ButtonPadding;
    const modalWidth = buttonRowWidth + 2 * ModalPadding;
    const modalHeight =
      ButtonHeight * 3 + ButtonPadding * 2 + ModalPadding * 2;
    this.width = modalWidth;
    this.height = modalHeight;

    // TODO: add text in front

    for (let i = 0; i < 3; i++) {
      const offsetX =
        -buttonRowWidth / 2 +
        i * (ButtonWidth + ButtonPadding) +
        ButtonWidth / 2;

      const upperBid = bids[i];
      const upperOffset = -modalHeight / 2 + ModalPadding + ButtonHeight / 2;
      const upperButton = new ActionButtonNode(
        `${this.id}-bid-value-upper-${i}`
      );
      upperButton.textNode.text = upperBid.text;
      upperButton.rectNode.height = ButtonHeight;
      upperButton.rectNode.width = ButtonWidth;
      upperButton.offset[0] = offsetX;
      upperButton.offset[1] = upperOffset;
      upperButton.onClick = () => {
        // TODO: set selected bid
      };
      this.addChild(upperButton);

      const lowerBid = bids[i + 3];
      const lowerButton = new ActionButtonNode(
        `${this.id}-bid-value-lower-${i}`
      );
      lowerButton.textNode.text = lowerBid.text;
      lowerButton.rectNode.height = ButtonHeight;
      lowerButton.rectNode.width = ButtonWidth;
      lowerButton.offset[0] = offsetX;
      lowerButton.offset[1] = upperOffset + ButtonHeight + ButtonPadding;
      lowerButton.onClick = () => {
        // TODO: set selected bid
      };
      this.addChild(lowerButton);
    }

    const passButton = new ActionButtonNode(`${this.id}-bid-pass`);
    passButton.textNode.text = "PASS";
    passButton.rectNode.height = ButtonHeight;
    passButton.rectNode.width = buttonRowWidth;
    passButton.offset[1] =
      -modalHeight / 2 +
      ModalPadding +
      2 * (ButtonHeight + ButtonPadding) +
      ButtonHeight / 2;
    this.addChild(passButton);
  }
}
