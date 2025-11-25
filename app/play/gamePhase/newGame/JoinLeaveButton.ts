import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { JoinLeaveButtonId } from "../../NodeIds";
import { PlaySceneContext } from "../../PlaySceneContext";

export class JoinLeaveButton extends TextActionButtonNode {
  public context: PlaySceneContext;
  private inGame = false;

  constructor(context: PlaySceneContext) {
    super(JoinLeaveButtonId);
    this.context = context;

    this.size.set({ width: 140, height: 50 });
    this.offset = [-100, 205];
    this.setText("Join Game");
    this.internalNode.theme = {
      ...ActionButtonTextTheme,
      fontSize: 24,
    };
  }

  public setInGame = (inGame: boolean) => {
    this.inGame = inGame;
    this.setText(inGame ? "Leave Game" : "Join Game");
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
