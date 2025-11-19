import { RectNode } from "./RectNode";
import { TextNode } from "./TextNode";
import { TwoDNode } from "./TwoDNode";

export class ButtonNode extends TwoDNode {
  public textNode: TextNode;
  public rectNode: RectNode;

  constructor(id: string) {
    super(id);
    this.rectNode = new RectNode(`${id}-rect-node`);
    this.addChild(this.rectNode);
    this.textNode = new TextNode(`${id}-text-node`);
    this.addChild(this.textNode);
  }
}
