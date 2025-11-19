import { DurationNode } from "./DurationNode";

export interface TimerNodeListener {
  (): void;
}

export class TimerNode extends DurationNode {
  public listeners = new Set<TimerNodeListener>();

  protected signalFinished = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };
}
