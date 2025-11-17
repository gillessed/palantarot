import { EasingFunctions, type EasingFunction } from "../math/Easing";
import { DurationNode } from "./DurationNode";

export interface AnimationUpdateListener {
  (value: number): void;
}

export interface AnimationFinishedListener {
  (): void;
}

export class AnimationNode<SceneContext> extends DurationNode<SceneContext> {
  public updateListeners = new Set<AnimationUpdateListener>();
  public finishListeners = new Set<AnimationFinishedListener>();
  public startValue = 0;
  public endValue = 1;
  public easing?: EasingFunction;
  // TODO: add easing types

  public update = (dt: number) => {
    this.updateState(dt);
    if (this.running) {
      const scalar = this.currentTime / this.durationMs;
      const eased =
        this.easing != null ? EasingFunctions[this.easing](scalar) : scalar;
      // TODO: easing would happen here
      const interpolated =
        this.startValue + (this.endValue - this.startValue) * eased;
      this.signalUpdate(interpolated);
    }
  };

  public start = () => {
    if (!this.running) {
      this.running = true;
      this.currentTime = 0;
      this.signalUpdate(this.startValue);
    }
  };

  protected signalFinished = () => {
    for (const listener of this.finishListeners) {
      listener();
    }
  };

  private signalUpdate = (value: number) => {
    for (const listener of this.updateListeners) {
      listener(value);
    }
  };
}
