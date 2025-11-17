import { ImageNode } from "../../sceneGraph/nodes/2d/ImageNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import type { ImageAssets } from "../assets/ImageAssets";
import { TableNodeId } from "../NodeIds";
import type { PlaySceneContext } from "../PlaySceneContext";
import { TableNode } from "../TableNode";

export class LoadedImageNode extends ImageNode<PlaySceneContext> {
  private assetKey: keyof ImageAssets;

  constructor(id: string, assetKey: keyof ImageAssets) {
    super(id);
    this.assetKey = assetKey;
  }

  public setAssetKey = (assetKey: typeof this.assetKey) => {
    this.assetKey = assetKey;
    if (this.container != null) {
      this.updateImage(this.container);
    }
  };

  public onMount = (container: NodeManager<PlaySceneContext>) => {
    this.updateImage(container);
  };

  private updateImage = (container: NodeManager<PlaySceneContext>) => {
    const tableNode = container.getNode<TableNode>(TableNodeId);
    if (tableNode == null) {
      console.warn("Have a card with no table node present");
      return;
    }
    this.image = tableNode.imageAssets[this.assetKey];
  };

  public onUnmount = () => {
    this.image = undefined;
  };
}
