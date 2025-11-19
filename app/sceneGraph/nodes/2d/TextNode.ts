import type { TextTheme } from "../../scene/Theme";
import { TwoDNode } from "./TwoDNode";

const DefaultFont = "verdana";
const DefaultFontSize = 18;

export class TextNode extends TwoDNode {
  public theme?: TextTheme;
  public text: string = "";
  public textAlign: CanvasTextAlign = "center";
  public textBaseline: CanvasTextBaseline = "middle";
  public maxWidth?: number;

  public render = (ctx: CanvasRenderingContext2D) => {
    if (this.text === "") {
      return;
    }
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    const fontSize = this.theme?.fontSize ?? DefaultFontSize;
    const fontFamily = this.theme?.fontFamily ?? DefaultFont;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.font = ctx.fillStyle = this.theme?.textColor ?? "#ffffff";

    if (this.theme?.textBorderColor != null) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = this.theme?.textBorderColor;
      ctx.strokeText(this.text, this.position[0], this.position[1]);
    }

    ctx.fillText(this.text, this.position[0], this.position[1]);
  };
}
