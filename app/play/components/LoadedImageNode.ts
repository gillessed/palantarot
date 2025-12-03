import { ImageNode } from "../../sceneGraph/nodes/2d/ImageNode";
import type { NodeManager } from "../../sceneGraph/nodes/SceneNode";
import { createDefaultProperty } from "../../sceneGraph/property/Property";
import type { ImageAssets } from "../assets/ImageAssets";
import { TableNodeId } from "../NodeIds";
import { TableNode } from "../TableNode";

export type LoadedImageKey = keyof ImageAssets | undefined;

export class LoadedImageNode extends ImageNode {
  public assetKey = createDefaultProperty<LoadedImageKey>(undefined);

  constructor(id: string, assetKey?: LoadedImageKey) {
    super(id);
    this.assetKey.set(assetKey);
  }

  public onMount = (container: NodeManager) => {
    const cleanup = this.assetKey.getAndListen(
      (newAssetKey: LoadedImageKey) => {
        this.updateImage(container, newAssetKey);
      }
    );
    return () => {
      cleanup();
    };
  };

  private updateImage = (container: NodeManager, assetKey: LoadedImageKey) => {
    const tableNode = container.getNode<TableNode>(TableNodeId);
    if (tableNode == null) {
      console.warn("Have a card with no table node present");
      return;
    }
    if (assetKey != null) {
      this.image = tableNode.imageAssets[assetKey];
    } else {
      this.image = undefined;
    }
  };

  public onUnmount = () => {
    this.image = undefined;
  };
}
