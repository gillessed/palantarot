import { ActionButtonNode } from "../../components/ActionButtonNode";
import { JoinGameButtonId } from "../../NodeIds";

export class JoinGameButton extends ActionButtonNode {
  constructor() {
    super(JoinGameButtonId);
    this.textNode.text = "Join Game";
    this.rectNode.width = 300;
    this.rectNode.height = 100;
  }

  public onClick = () => {
    this.container?.context.eventHandler.joinGame();
  };
}
