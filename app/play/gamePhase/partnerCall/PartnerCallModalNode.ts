import type {
  Card,
  FaceCardValue,
  RegSuit,
} from "../../../../server/play/model/Card";
import {
  createLayoutNode,
  LayoutNode,
  SizeableNode,
} from "../../../sceneGraph/nodes/2d/LayoutNode";
import type { SvgTheme } from "../../../sceneGraph/nodes/2d/SvgNode";
import { SvgPaths, type SvgPath } from "../../assets/SvgPaths";
import { ModalNode } from "../../components/ModalNode";
import { SvgActionButtonNode } from "../../components/SvgActionButtonNode";
import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import { DefaultActionButtonTheme } from "../../constants/Themes";
import { PartnerCallModalId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { getAllowedPartnerCalls } from "./getAllowedPartnerCalls";

const SuitButtonValues: [RegSuit, SvgPath, SvgTheme][] = [
  ["C", SvgPaths.Club, { backgroundColor: "green" }],
  ["D", SvgPaths.Diamond, { backgroundColor: "blue" }],
  ["H", SvgPaths.Heart, { backgroundColor: "red" }],
  ["S", SvgPaths.Spade, { backgroundColor: "black" }],
];

const CardButtonValues: FaceCardValue[] = ["V", "C", "D", "R"];

const ModalPadding = 50;
const ButtonWidth = 80;
const ButtonHeight = 50;
const ButtonGap = 20;

export class PartnerCallModalNode extends ModalNode {
  public context: PlaySceneContext;
  public outerLayout: LayoutNode;
  public selectedValue: FaceCardValue = "R";
  public cardButtons = new Map<FaceCardValue, TextActionButtonNode>();
  public selectedSuit?: RegSuit;
  public suitButtons = new Map<RegSuit, SvgActionButtonNode>();
  public callButton: TextActionButtonNode;

  constructor(context: PlaySceneContext, hand: ReadonlyArray<Card>) {
    super(PartnerCallModalId);
    this.context = context;

    const buttonPairNodes: SizeableNode[] = [];
    const allowedCalls = getAllowedPartnerCalls(hand, false);
    for (let i = 0; i < 4; i++) {
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
      suitButton.setBaseTheme({
        ...DefaultActionButtonTheme,
        backgroundColor: "white",
      });
      suitButton.onClick = () => {
        this.setSelectedSuit(suit);
      };
      this.suitButtons.set(suit, suitButton);

      const card = CardButtonValues[i];
      const cardButton = new TextActionButtonNode(
        `${this.id}-card-button-${i}`,
        card
      );
      cardButton.size.set({
        width: ButtonWidth,
        height: ButtonHeight,
      });
      cardButton.setDisabled(!allowedCalls[3 - i]);
      if (card === this.selectedValue) {
        cardButton.setSelected(true);
      }
      cardButton.onClick = () => {
        this.setSelectedValue(card);
      };

      const buttonPairNode = createLayoutNode({
        id: `${this.id}-button-pair-${i}`,
        nodes: [suitButton, cardButton],
        axis: "y",
        gap: ButtonGap,
      });
      this.cardButtons.set(card, cardButton);
      buttonPairNodes.push(buttonPairNode);
    }

    this.callButton = new TextActionButtonNode(`${this.id}-bid-pass`);
    this.callButton.setText("Call");
    this.callButton.setDisabled(true);
    this.callButton.size.set({
      width: ButtonHeight * 2 + ButtonGap,
      height: ButtonHeight * 2 + ButtonGap,
    });
    this.callButton.onClick = () => {
      if (this.selectedSuit != null) {
        this.context.eventHandler.callPartner([
          this.selectedSuit,
          this.selectedValue,
        ]);
      }
    };

    const buttonLayoutNode = createLayoutNode({
      id: `${this.id}-suit-button-layout`,
      nodes: [...buttonPairNodes, this.callButton],
      gap: ButtonGap,
    });

    this.outerLayout = createLayoutNode({
      id: `${this.id}-outer-layout`,
      nodes: [buttonLayoutNode],
      padding: ModalPadding,
    });
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

  public setSelectedValue = (value: FaceCardValue) => {
    this.cardButtons.get(this.selectedValue)?.setSelected(false);
    this.cardButtons.get(value)?.setSelected(true);
    this.selectedValue = value;
  };

  public setSelectedSuit = (value: RegSuit) => {
    if (this.selectedSuit != null) {
      this.suitButtons.get(this.selectedSuit)?.setSelected(false);
    }
    this.suitButtons.get(value)?.setSelected(true);
    this.selectedSuit = value;
    this.callButton.setDisabled(false);
  };
}
