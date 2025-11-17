import { ActionButtonNode } from "../../components/ActionButtonNode";
import { MarkUnreadyButtonId } from "../../NodeIds";

export class MarkUnreadyButton extends ActionButtonNode {
  constructor() {
    super(MarkUnreadyButtonId);
    this.textNode.text = "Not Ready";
    this.rectNode.width = 300;
    this.rectNode.height = 100;
    this.visible = false;
  }

  public onClick = () => {
    this.container?.context.eventHandler.markUnready();
  };
}
