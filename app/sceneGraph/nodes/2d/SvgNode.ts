import type { SvgPath } from "../../../play/assets/SvgPaths";
import type { BorderTheme, ShapeTheme } from "../../scene/Theme";
import { TwoDNode } from "./TwoDNode";

export type SvgTheme = ShapeTheme & BorderTheme;

export class SvgNode extends TwoDNode {
  public path?: SvgPath;
  public theme?: SvgTheme;

  public render = (ctx: CanvasRenderingContext2D) => {
    if (this.path == null) {
      return;
    }
    const borderWidth = this.theme?.borderWidth ?? 0;
    ctx.lineWidth = borderWidth;
    ctx.fillStyle = this.theme?.backgroundColor ?? "#000000";

    const { pathString, viewBox } = this.path;
    const [dx, dy] = viewBox;

    ctx.save();
    ctx.translate(-dx / 2, -dy / 2);

    const path2d = new Path2D(pathString);
    ctx.fill(path2d);
    if (this.theme?.borderColor != null) {
      ctx.strokeStyle = this.theme?.borderColor ?? "";
      ctx.stroke(path2d);
    }
    ctx.restore();
  };
}
