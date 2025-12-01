import { RectNode } from "./RectNode";

const CardSourcePadding = 38;
const CardSourceWidth = 810;
const CardSourceHeight = 1260;

const SourceRect = {
  x: CardSourcePadding,
  y: CardSourcePadding,
  w: CardSourceWidth - 2 * CardSourcePadding,
  h: CardSourceHeight - 2 * CardSourcePadding,
};

export class ImageNode extends RectNode {
  public image: CanvasImageSource | undefined;

  public render = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = this.size.get();
    const x = this.position[0] - width / 2;
    const y = this.position[1] - height / 2;
    if (this.image != null) {
      ctx.drawImage(
        this.image,
        SourceRect.x,
        SourceRect.y,
        SourceRect.w,
        SourceRect.h,
        x,
        y,
        width,
        height
      );
    }
  };
}
