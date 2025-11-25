import { SvgNode, type SvgTheme } from "../../sceneGraph/nodes/2d/SvgNode";
import type { SvgPath } from "../assets/SvgPaths";
import { ActionButtonNode } from "./ActionButtonNode";

export class SvgActionButtonNode extends ActionButtonNode<SvgNode> {
  constructor(id: string, path?: SvgPath) {
    super(id, new SvgNode(`${id}-svg`));
    if (path != null) {
      this.setPath(path);
    }
  }

  public setPath = (path: SvgPath) => {
    this.internalNode.path = path;
  };

  public setSvgTheme = (theme: SvgTheme) => {
    this.internalNode.theme = theme;
  };
}
