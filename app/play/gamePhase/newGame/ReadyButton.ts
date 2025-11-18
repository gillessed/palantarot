import { ActionButtonNode } from "../../components/ActionButtonNode";
import { ActionButtonTextTheme } from "../../constants/Themes";
import { ReadyButtonId } from "../../NodeIds";

export class ReadyButton extends ActionButtonNode {
  private ready = false;

  constructor() {
    super(ReadyButtonId);

    this.rectNode.width = 70;
    this.rectNode.height = 40;
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
      this.container?.context.eventHandler.markUnready();
    } else {
      this.container?.context.eventHandler.markReady();
    }
  };
}
