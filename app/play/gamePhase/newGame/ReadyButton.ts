import { ActionButtonNode } from "../../components/ActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { ReadyButtonId } from "../../NodeIds";
import { PlaySceneContext } from "../../PlaySceneContext";

export class ReadyButton extends ActionButtonNode {
  private ready = false;
  public context: PlaySceneContext;

  constructor(context: PlaySceneContext) {
    super(ReadyButtonId);
    this.context = context;

    this.size.set({ width: 70, height: 40 });
    this.offset[0] = 92;
    this.textNode.text = "Ready";
    this.textNode.theme = {
      ...ActionButtonTextTheme,
      fontSize: 18,
    };
  }

  public setReady = (ready: boolean) => {
    this.ready = ready;
    this.textNode.text = ready ? "Unready" : "Ready";
  };

  public onClick = () => {
    if (this.ready) {
      this.context.eventHandler.markUnready();
    } else {
      this.context.eventHandler.markReady();
    }
  };
}
