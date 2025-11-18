import { ActionButtonNode } from "../../components/ActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { JoinLeaveButtonId } from "../../NodeIds";

export class JoinLeaveButton extends ActionButtonNode {
  private inGame = false;

  constructor() {
    super(JoinLeaveButtonId);

    this.rectNode.width = 140;
    this.rectNode.height = 50;
    this.offset = [-100, 205];
    this.textNode.text = "Join Game";
    this.textNode.theme = {
      ...ActionButtonTextTheme,
      fontSize: 24,
    };
  }

  public setInGame = (inGame: boolean) => {
    this.inGame = inGame;
    this.textNode.text = inGame ? "Leave Game" : "Join Game";
  };

  public setReady = (ready: boolean) => {
    this.setDisabled(ready);
  };

  public onClick = () => {
    if (this.inGame) {
      this.container?.context.eventHandler.leaveGame();
    } else {
      this.container?.context.eventHandler.joinGame();
    }
  };
}
