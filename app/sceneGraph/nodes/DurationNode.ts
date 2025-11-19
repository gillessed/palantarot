import { SceneNode } from "./SceneNode";

export abstract class DurationNode extends SceneNode {
  public durationMs: number = 1_000;
  public repeating = false;
  public startValue = 0;
  public endValue = 1;

  protected running = false;
  protected currentTime = 0;

  protected updateState = (dt: number) => {
    if (!this.running) {
      return;
    }
    this.currentTime += dt;
    if (this.currentTime > this.durationMs) {
      this.signalFinished();
      if (this.repeating) {
        this.currentTime -= this.durationMs;
      } else {
        this.running = false;
      }
    }
  };

  public update = (dt: number) => {
    this.updateState(dt);
  };

  public start = () => {
    if (!this.running) {
      this.running = true;
      this.currentTime = 0;
    }
  };

  public stop = () => {
    this.running = false;
  };

  get isRunning() {
    return this.running;
  }

  protected abstract signalFinished(): void;
}
