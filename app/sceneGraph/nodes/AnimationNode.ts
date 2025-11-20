import { interpolateValue } from "../../play/constants/PlayColors";
import { EasingFunctions, type EasingFunction } from "../math/Easing";
import { DurationNode } from "./DurationNode";

export interface AnimationUpdateListener {
  (value: number): void;
}

export interface AnimationFinishedListener {
  (): void;
}

export class AnimationNode extends DurationNode {
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
      const interpolated = interpolateValue(
        this.startValue,
        this.endValue,
        eased
      );
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
    this.signalUpdate(this.endValue);
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
