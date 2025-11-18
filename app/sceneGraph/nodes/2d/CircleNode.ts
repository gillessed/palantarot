import type { Vector } from "../../math/Vector";
import type { BorderTheme, ShapeTheme } from "../../scene/Theme";
import { TwoDNode } from "./TwoDNode";

export type CircleTheme = ShapeTheme & BorderTheme;

export class CircleNode<SceneContext> extends TwoDNode<SceneContext> {
  public theme?: CircleTheme;
  public radius = 0;

  public intersects = ([x, y]: Vector): boolean => {
    const dx = this.position[0] - x;
    const dy = this.position[1] - y;
    const rr = this.radius * this.radius;
    return dx * dx + dy * dy < rr;
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = this.theme?.borderColor ?? "";
    const borderWidth = this.theme?.borderWidth ?? 0;
    ctx.lineWidth = borderWidth;
    ctx.fillStyle = this.theme?.backgroundColor ?? "#000000";
    ctx.beginPath();
    const [x, y] = this.position;
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    if (borderWidth > 0) {
      ctx.stroke();
    }
  };
}
