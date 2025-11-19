import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import {
  PlayerInfoNodeHeight,
  PlayerInfoNodeWidth,
} from "../../components/PlayerInfoNode";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { pathRoundedRectangle } from "../../utils/pathRoundedRectangle";

export const PlayerNodeWidth = 300;
export const PlayerRowHeight = 60;

export class EmptyRowNode extends TwoDNode {
  public render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    const rectPath = new Path2D();
    pathRoundedRectangle(
      rectPath,
      -PlayerInfoNodeWidth / 2,
      -PlayerInfoNodeHeight / 2,
      PlayerInfoNodeWidth,
      PlayerInfoNodeHeight,
      10
    );
    ctx.fill(rectPath);
  };
}
