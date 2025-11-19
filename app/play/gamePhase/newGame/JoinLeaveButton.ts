import { ActionButtonNode } from "../../components/ActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { JoinLeaveButtonId } from "../../NodeIds";
import { PlaySceneContext } from "../../PlaySceneContext";

export class JoinLeaveButton extends ActionButtonNode {
  public context: PlaySceneContext;
  private inGame = false;

  constructor(context: PlaySceneContext) {
    super(JoinLeaveButtonId);
    this.context = context;

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
      this.context.eventHandler.leaveGame();
    } else {
      this.context.eventHandler.joinGame();
    }
  };
}
