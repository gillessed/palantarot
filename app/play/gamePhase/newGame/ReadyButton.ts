import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { ReadyButtonId } from "../../NodeIds";
import { PlaySceneContext } from "../../PlaySceneContext";

export class ReadyButton extends TextActionButtonNode {
  private ready = false;
  public context: PlaySceneContext;

  constructor(context: PlaySceneContext) {
    super(ReadyButtonId);
    this.context = context;

    this.size.set({ width: 70, height: 40 });
    this.offset[0] = 92;
    this.setText("Ready");
    this.internalNode.theme = {
      ...ActionButtonTextTheme,
      fontSize: 18,
    };
  }

  public setReady = (ready: boolean) => {
    this.ready = ready;
    this.setText(ready ? "Unready" : "Ready");
  };

  public onClick = () => {
    if (this.ready) {
      this.context.eventHandler.markUnready();
    } else {
      this.context.eventHandler.markReady();
    }
  };
}
