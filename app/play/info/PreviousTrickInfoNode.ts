import { RectNode } from "../../sceneGraph/nodes/2d/RectNode";
import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { AreaTextTheme, DarkenBackgroundColor } from "../constants/Themes";
import { PreviousTrickInfoNodeId } from "../NodeIds";

export class PreviousTrickInfoNode extends TwoDNode {
  private backgroundNode: RectNode;
  private textNode: TextNode;
  constructor() {
    super(PreviousTrickInfoNodeId);

    this.backgroundNode = new RectNode(`${this.id}-background`);
    this.backgroundNode.width = 300;
    this.backgroundNode.height = 150;
    this.backgroundNode.offset = [160, 75];
    this.backgroundNode.theme = {
      backgroundColor: DarkenBackgroundColor,
      borderRadius: 10,
    }
    this.addChild(this.backgroundNode);

    this.textNode = new TextNode(`${this.id}-text`);
    this.textNode.text = "Previous Trick";
    this.textNode.textAlign = "left";
    this.textNode.textBaseline = "top";
    this.textNode.offset = [15, 5];
    this.textNode.theme = AreaTextTheme;
    this.addChild(this.textNode);
  }
}
