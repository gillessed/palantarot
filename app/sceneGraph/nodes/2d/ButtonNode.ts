import { RectNode } from "./RectNode";
import { TextNode } from "./TextNode";
import { TwoDNode } from "./TwoDNode";

export class ButtonNode<SceneContext> extends TwoDNode<SceneContext> {
  public textNode: TextNode<SceneContext>;
  public rectNode: RectNode<SceneContext>;

  constructor(id: string) {
    super(id);
    this.rectNode = new RectNode(`${id}-rect-node`);
    this.addChild(this.rectNode);
    this.textNode = new TextNode(`${id}-text-node`);
    this.addChild(this.textNode);
  }
}
