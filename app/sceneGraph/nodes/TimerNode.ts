import { interpolateValue } from "../../play/constants/PlayColors";
import { EasingFunctions, type EasingFunction } from "../math/Easing";
import { createDefaultProperty } from "../property/Property";
import { SceneNode } from "./SceneNode";

export interface TimerStartArgs {
  onChanged?: (value: number) => void;
  onFinished?: () => void;
}

export class TimerNode extends SceneNode {
  private cleanupFunctions: Array<() => void> = [];
  public durationMs: number = 1_000;
  public repeating = false;
  public startValue = 0;
  public endValue = 1;
  public value = createDefaultProperty(0);
  public finished = createDefaultProperty(0);
  public reversed = false;
  public easing?: EasingFunction;

  private currentTime = 0;
  private running = false;

  public update = (dt: number) => {
    if (!this.running) {
      return;
    }
    const newTime = this.currentTime + dt;
    this.processTime(newTime);
    this.currentTime = newTime;
    if (newTime > this.durationMs) {
      this.finished.set(this.reversed ? this.startValue : this.endValue);
      if (this.repeating) {
        this.currentTime -= this.durationMs;
      } else {
        this.stop();
      }
    }
  };

  private processTime = (newTime: number) => {
    const delta = newTime / this.durationMs;
    const scalar = this.reversed ? 1 - delta : delta;
    const eased =
      this.easing != null ? EasingFunctions[this.easing](scalar) : scalar;
    const interpolated = interpolateValue(
      this.startValue,
      this.endValue,
      eased
    );
    this.value.set(interpolated);
  };

  public start = (args?: TimerStartArgs) => {
    const { onChanged, onFinished } = args ?? {};
    if (this.running) {
      return;
    }
    this.running = true;
    this.currentTime = 0;
    this.value.set(this.reversed ? this.endValue : this.startValue);
    this.cleanupFunctions = [];
    if (onChanged != null) {
      this.cleanupFunctions.push(this.value.listen(onChanged));
    }
    if (onFinished) {
      this.cleanupFunctions.push(this.finished.listen(onFinished));
    }
  };

  public stop = () => {
    this.running = false;
    for (const cleanup of this.cleanupFunctions) {
      cleanup();
    }
  };

  get isRunning() {
    return this.running;
  }

  public instant = () => {
    this.finished.set(this.reversed ? this.startValue : this.endValue);
    this.stop();
  };

  public listen = (listener: (value: number) => void) => {
    const valueCleanup = this.value.listen(listener);
    const finishedCleanup = this.finished.listen(listener);
    return () => {
      valueCleanup();
      finishedCleanup();
    };
  };
}
