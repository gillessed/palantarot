import type {
  Card,
  RegSuit,
  RegValue,
} from "../../../../server/play/model/Card";
import { LayoutNode } from "../../../sceneGraph/nodes/2d/LayoutNode";
import type { SvgTheme } from "../../../sceneGraph/nodes/2d/SvgNode";
import { SvgPaths, type SvgPath } from "../../assets/SvgPaths";
import { ModalNode } from "../../components/ModalNode";
import { SvgActionButtonNode } from "../../components/SvgActionButtonNode";
import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import { PartnerCallModalId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";

const SuitButtonValues: [RegSuit, SvgPath, SvgTheme][] = [
  ["C", SvgPaths.Club, { backgroundColor: "green" }],
  ["D", SvgPaths.Diamond, { backgroundColor: "blue" }],
  ["H", SvgPaths.Heart, { backgroundColor: "red" }],
  ["S", SvgPaths.Spade, { backgroundColor: "black" }],
];

const CardButtonValues: RegValue[] = ["V", "C", "D", "R"];

const ModalPadding = 50;
const ButtonWidth = 80;
const ButtonHeight = 50;
const ButtonPadding = 20;

export class PartnerCallModalNode extends ModalNode {
  public context: PlaySceneContext;
  public outerLayout: LayoutNode;

  constructor(context: PlaySceneContext, hand: ReadonlyArray<Card>) {
    super(PartnerCallModalId);
    this.context = context;

    this.outerLayout = new LayoutNode(`${this.id}-outer-layout`);
    this.outerLayout.axis = "y";
    this.outerLayout.padding = ModalPadding;

    const buttonLayoutNode = new LayoutNode(`${this.id}-suit-button-layout`);
    buttonLayoutNode.gap = ButtonPadding;
    for (let i = 0; i < 4; i++) {
      const buttonPairLayoutNode = new LayoutNode(
        `${this.id}-button-pair-${i}`
      );
      buttonPairLayoutNode.axis = "y";
      buttonPairLayoutNode.gap = ButtonPadding;

      const [suit, path, theme] = SuitButtonValues[i];
      const suitButton = new SvgActionButtonNode(
        `${this.id}-suit-button-${i}`,
        path
      );
      suitButton.internalNode.scale = [32, 32];
      suitButton.setSvgTheme(theme);
      suitButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      buttonPairLayoutNode.pushNodes(suitButton);

      const card = CardButtonValues[i];
      const cardButton = new TextActionButtonNode(
        `${this.id}-card-button-${i}`
      );
      cardButton.setText(card);
      cardButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      buttonPairLayoutNode.pushNodes(cardButton);
      buttonLayoutNode.pushNodes(buttonPairLayoutNode);
    }

    const callButton = new TextActionButtonNode(`${this.id}-bid-pass`);
    callButton.setText("Call");
    callButton.size.set({
      width: ButtonHeight * 2 + ButtonPadding,
      height: ButtonHeight * 2 + ButtonPadding,
    });
    buttonLayoutNode.pushNodes(callButton);
    this.outerLayout.pushNodes(buttonLayoutNode);
    this.addChild(this.outerLayout);
  }

  public onMount = () => {
    const removeListener = this.outerLayout.size.listen((size) => {
      this.size.set(size);
    });
    return () => {
      removeListener();
    };
  };
}
