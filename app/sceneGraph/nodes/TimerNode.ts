import { DurationNode } from "./DurationNode";

export interface TimerNodeListener {
  (): void;
}

export class TimerNode<SceneContext> extends DurationNode<SceneContext> {
  public listeners = new Set<TimerNodeListener>();

  protected signalFinished = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };
}
