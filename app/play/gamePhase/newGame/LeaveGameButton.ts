import { ActionButtonNode } from "../../components/ActionButtonNode";
import { LeaveGameButtonId } from "../../NodeIds";

export class LeaveGameButton extends ActionButtonNode {
  constructor() {
    super(LeaveGameButtonId);
    this.textNode.text = "Leave Game";
    this.rectNode.width = 300;
    this.rectNode.height = 100;
    this.offset[0] = 160;
    this.visible = false;
  }

  public onClick = () => {
    this.container?.context.eventHandler.leaveGame();
  };
}
