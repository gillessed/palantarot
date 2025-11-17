import { pathRoundedRectangle } from "../../../play/utils/pathRoundedRectangle";
import type { Vector } from "../../math/Vector";
import type { BorderTheme, ShapeTheme } from "../../scene/Theme";
import { TwoDNode } from "./TwoDNode";

export type RectTheme = ShapeTheme & BorderTheme;

export class RectNode<SceneContext> extends TwoDNode<SceneContext> {
  public theme?: RectTheme;
  public width = 0;
  public height = 0;

  public intersects = ([x, y]: Vector): boolean => {
    const left = this.position[0] - this.width / 2;
    const right = left + this.width;
    const top = this.position[1] - this.height / 2;
    const bottom = top + this.height;
    return x > left && x < right && y > top && y < bottom;
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = this.theme?.borderColor ?? "";
    const borderWidth = this.theme?.borderWidth ?? 0;
    const borderRadius = this.theme?.borderRadius ?? 0;
    ctx.lineWidth = borderWidth;
    ctx.fillStyle = this.theme?.backgroundColor ?? "#000000";
    ctx.beginPath();
    const x = this.position[0] - this.width / 2;
    const w = this.width;
    const y = this.position[1] - this.height / 2;
    const h = this.height;
    if (borderRadius > 0) {
      pathRoundedRectangle(ctx, x, y, w, h, borderRadius);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
    if (borderWidth > 0) {
      ctx.stroke();
    }
  };
}
