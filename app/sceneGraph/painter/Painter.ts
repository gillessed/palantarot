import type { TwoDNode } from "../nodes/2d/TwoDNode";

export interface Painter {
  render(ctx: CanvasRenderingContext2D): void;
}