import { ActionButtonNode } from "../../components/ActionButtonNode";
import { MarkReadyButtonId } from "../../NodeIds";

export class MarkReadyButton extends ActionButtonNode {
  constructor() {
    super(MarkReadyButtonId);
    this.textNode.text = "Ready";
    this.rectNode.width = 300;
    this.rectNode.height = 100;
    this.offset[0] = -160;
    this.visible = false;
  }

  public onClick = () => {
    this.container?.context.eventHandler.markReady();
  };
}
