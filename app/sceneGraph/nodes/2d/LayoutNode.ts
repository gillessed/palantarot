import type { Size } from "recharts/types/util/types";
import { createDefaultProperty, type Property } from "../../property/Property";
import type { Sizeable } from "../../property/Size";
import { TwoDNode } from "./TwoDNode";

type SizeableNode = TwoDNode & Sizeable;

export class LayoutNode extends TwoDNode implements Sizeable {
  public gap: number = 0;
  public align: "top" | "middle" | "bottom" = "middle";
  public axis: "x" | "y" = "x";
  public padding = 0;
  public size: Property<Size> = createDefaultProperty({ width: 0, height: 0 });
  public nodes: SizeableNode[] = [];
  public removeListeners = new Map<SizeableNode, () => void>();

  public pushNodes = (...nodes: SizeableNode[]) => {
    this.nodes.push(...nodes);
    for (const node of nodes) {
      const removeListener = node.size.listen(this.layout);
      this.removeListeners.set(node, removeListener);
      this.addChild(node);
    }
    this.layout();
  };

  private getLayoutSize = (node: SizeableNode) => {
    const { width, height } = node.size.get();
    const length = this.axis === "x" ? width : height;
    const girth = this.axis === "x" ? height : width;
    return { length, girth };
  };

  private layout = () => {
    // Length along the arrangement axis
    let totalLength = 0;
    // Length along the non-arrangment axis
    let maximumGirth = 0;

    for (const node of this.nodes) {
      const { length, girth } = this.getLayoutSize(node);
      totalLength += length;
      maximumGirth = Math.max(maximumGirth, girth);
    }
    totalLength += 2 * this.padding + this.gap * (this.nodes.length - 1);
    const totalGirth = maximumGirth + 2 * this.padding;
    const width = this.axis === "x" ? totalLength : totalGirth;
    const height = this.axis === "x" ? totalGirth : totalLength;
    let lengthDelta = -totalLength / 2 + this.padding;
    for (const node of this.nodes) {
      const { length, girth } = this.getLayoutSize(node);
      node.offset[this.axis === "x" ? 0 : 1] = lengthDelta + length / 2;
      lengthDelta += length + this.gap;
    }
    this.size.set({
      width,
      height,
    });
  };

  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    const { width, height } = this.size.get();
    ctx.rect(-width / 2, -height / 2, width, height);
  };
}
