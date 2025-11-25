import { TwoDNode } from "../../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import {
  DogInfoNodeId,
  InfoNodeId,
  PartnerCallInfoNodeId,
  PreviousTrickInfoNodeId,
} from "../NodeIds";
import { createInfoAreaNode } from "./createInfoAreaNode";

export class InfoNode extends TwoDNode {
  constructor() {
    super(InfoNodeId);

    this.addChild(
      createInfoAreaNode(
        PreviousTrickInfoNodeId,
        [160, 75],
        300,
        150,
        "Previous Trick"
      )
    );
    this.addChild(
      createInfoAreaNode(DogInfoNodeId, [100, 235], 180, 150, "Dog")
    );
    this.addChild(
      createInfoAreaNode(
        PartnerCallInfoNodeId,
        [255, 235],
        110,
        150,
        "Partner Call"
      )
    );
  }

  public onMount = (container: NodeManager) => {
    const removeListener = container.size.listen(({ height }) => {
      this.offset[1] = height - 320;
    });
    return () => {
      removeListener();
    };
  };
}
