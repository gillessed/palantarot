import { RectNode } from "./RectNode";

export class ImageNode extends RectNode {
  public image: CanvasImageSource | undefined;

  public render = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = this.size.get();
    const x = this.position[0] - width / 2;
    const y = this.position[1] - height / 2;
    if (this.image != null) {
      ctx.drawImage(this.image, x, y, width, height);
    }
  };
}
