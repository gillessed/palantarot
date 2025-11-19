import { SceneNode } from "../sceneGraph/nodes/SceneNode";
import { loadImageAssets, type LoadStatus } from "./assets/loadImageAssets";
import { InfoNode } from "./info/InfoNode";
import { LoadingScreenNode } from "./LoadingScreenNode";
import { LoadingScreenNodeId, RootNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";
import { TableNode } from "./TableNode";

export class RootNode extends SceneNode {
  public context: PlaySceneContext;
  private infoNode = new InfoNode();
  private loadingScreenNode: LoadingScreenNode | undefined;

  constructor(context: PlaySceneContext) {
    super(RootNodeId);
    this.context = context;
    this.addChild(this.infoNode);
    const loadingScreenNode = new LoadingScreenNode();
    this.addChild(loadingScreenNode);
    this.loadingScreenNode = loadingScreenNode;
  }

  public onMount = () => {
    this.loadImages();
  };

  private onLoadUpdate = ({ loaded, total }: LoadStatus) => {
    if (this.loadingScreenNode != null) {
      this.loadingScreenNode.fillAmount = loaded / total;
    }
  };

  private loadImages = async () => {
    const imageAssets = await loadImageAssets(this.onLoadUpdate);
    this.removeChildById(LoadingScreenNodeId);
    const tableNode = new TableNode(this.context, imageAssets);
    this.addChild(tableNode);
  };
}
