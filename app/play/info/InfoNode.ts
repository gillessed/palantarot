import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import { InfoNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import { DogInfoNode } from "./DogInfoNode";
import { PartnerCallInfoNode } from "./PartnerCallInfoNode";
import { PreviousTrickInfoNode } from "./PreviousTrickInfoNode";

export class InfoNode extends TwoDNode<PlaySceneContext> {
  constructor() {
    super(InfoNodeId);

    this.addChild(new PreviousTrickInfoNode());
    this.addChild(new DogInfoNode());
    this.addChild(new PartnerCallInfoNode());
  }

  public update = (_: number) => {
    this.offset = [0, (this.container?.height ?? 0) - 320];
  };
}
