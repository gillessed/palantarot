import { v4 as uuid } from "uuid";
import { interpolateVector, Vector } from "../../sceneGraph/math/Vector";
import { SceneNode } from "../../sceneGraph/nodes/SceneNode";
import { TimerNode } from "../../sceneGraph/nodes/TimerNode";
import { EasingFunction } from "../../sceneGraph/math/Easing";
import { interpolateValue } from "./interpolateValue";

export interface AnimateOptions {
  durationMs?: number;
  easing?: EasingFunction;
}

export async function animateValue(
  node: SceneNode,
  from: number,
  to: number,
  onChanged: (value: number) => void,
  options?: AnimateOptions,
): Promise<void> {
  return animateType(node, from, to, interpolateValue, onChanged, options);
}

export async function animateVector(
  node: SceneNode,
  from: Vector,
  to: Vector,
  onChanged: (value: Vector) => void,
  options?: AnimateOptions,
): Promise<void> {
  return animateType(node, from, to, interpolateVector, onChanged, options);
}

export async function animateType<T>(
  node: SceneNode,
  from: T,
  to: T,
  interpolate: (from: T, to: T, value: number) => T,
  onChanged: (value: T) => void,
  options?: AnimateOptions,
) {
  const timer = new TimerNode(uuid());
  node.addChild(timer);
  if (options?.durationMs != null) {
    timer.durationMs = options.durationMs;
  }
  if (options?.easing != null) {
    timer.easing = options.easing;
  }
  return new Promise<void>((resolve) => {
    timer.start({
      onChanged: (value) => {
        const interpolated = interpolate(from, to, value);
        onChanged(interpolated);
      },
      onFinished: () => {
        timer.removeSelf();
        onChanged(to);
        resolve();
      },
    });
  });
}
