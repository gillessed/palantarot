import { Matrix } from "../math/Matrix";

export interface RenderUnit {
  zIndex: number;
  transformation: Matrix;
  updateContext: (context: CanvasRenderingContext2D) => void;
  render: (context: CanvasRenderingContext2D) => void;
};
