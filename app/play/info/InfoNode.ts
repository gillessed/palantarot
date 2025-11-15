import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { InfoNodeId } from "../NodeIds";
import { PreviousTrickInfoNode } from "./PreviousTrickInfoNode";

export class InfoNode extends TwoDNode {
  constructor() {
    super(InfoNodeId);

    const previousTrickInfoNode = new PreviousTrickInfoNode();
    this.addChild(previousTrickInfoNode);
  }

  public update = (_: number) => {
    this.offset = [
      this.container?.width ?? 0,
      this.container?.height ?? 0,
    ];
  };
}