import { pathRoundedRectangle } from "../../../play/utils/pathRoundedRectangle";
import type { Vector } from "../../math/Vector";
import { createSizeProperty, type Sizeable } from "../../property/Size";
import type { BorderTheme, ShapeTheme } from "../../scene/Theme";
import { TwoDNode } from "./TwoDNode";

export type RectTheme = ShapeTheme & BorderTheme;

export class RectNode extends TwoDNode implements Sizeable {
  public theme: RectTheme = {};
  public size = createSizeProperty();
  public getSize = () => this.size.get();

  public intersects = ([x, y]: Vector): boolean => {
    const { width, height } = this.size.get();
    const left = this.position[0] - width / 2;
    const right = left + width;
    const top = this.position[1] - height / 2;
    const bottom = top + height;
    return x > left && x < right && y > top && y < bottom;
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = this.size.get();
    ctx.strokeStyle = this.theme?.borderColor ?? "";
    const borderWidth = this.theme?.borderWidth ?? 0;
    const borderRadius = this.theme?.borderRadius ?? 0;
    ctx.lineWidth = borderWidth;
    ctx.fillStyle = this.theme?.backgroundColor ?? "#000000";
    const x = this.position[0] - width / 2;
    const w = width;
    const y = this.position[1] - height / 2;
    const h = height;
    ctx.shadowBlur = this.shadow;
    ctx.shadowColor = this.shadowColor;
    if (borderRadius > 0) {
      const path2d = new Path2D();
      pathRoundedRectangle(path2d, x, y, w, h, borderRadius);
      ctx.fill(path2d);
      if (borderWidth > 0) {
        ctx.stroke(path2d);
      }
    } else {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    }
  };

  public setTheme = (theme: RectTheme) => {
    this.theme = { ...theme };
  };
}
