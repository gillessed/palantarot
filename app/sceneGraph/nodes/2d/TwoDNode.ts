import { v_new, type Vector } from "../../math/Vector";
import type { Painter } from "../../painter/Painter";
import { SceneNode } from "../SceneNode";

export class TwoDNode extends SceneNode {
  public offset: Vector = v_new();
  public position: Vector = v_new();
  public scale: Vector = v_new(1, 1);
  public rotation: number = 0;
  public painter?: Painter;
  public visible = true;

  constructor(id: string, parent?: TwoDNode) {
    super(id, parent);
  }

  public transformContext = (ctx: CanvasRenderingContext2D) => {
    ctx.translate(this.offset[0], this.offset[1]);
    ctx.scale(this.scale[0], this.scale[1]);
    if (this.rotation !== 0) {
      ctx.rotate(this.rotation);
    }
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    if (this.visible) {
      this.painter?.render(ctx);
    }
  };
}
