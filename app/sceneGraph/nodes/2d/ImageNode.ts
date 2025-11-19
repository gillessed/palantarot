import { RectNode } from "./RectNode";

export class ImageNode extends RectNode {
  public image: CanvasImageSource | undefined;

  public render = (ctx: CanvasRenderingContext2D) => {
    const x = this.position[0] - this.width / 2;
    const y = this.position[1] - this.height / 2;
    if (this.image != null) {
      ctx.drawImage(this.image, x, y, this.width, this.height);
    }
  };
}
