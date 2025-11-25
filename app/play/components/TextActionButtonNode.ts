import { TextNode } from "../../sceneGraph/nodes/2d/TextNode";
import { ActionButtonTextTheme } from "../constants/Themes";
import { ActionButtonNode } from "./ActionButtonNode";

export class TextActionButtonNode extends ActionButtonNode<TextNode> {
  constructor(id: string, text: string = "") {
    super(id, new TextNode(`${id}-text`));
    this.setText(text);
    this.internalNode.theme = ActionButtonTextTheme;
  }

  public setText = (text: string) => {
    this.internalNode.text = text;
  };
}
