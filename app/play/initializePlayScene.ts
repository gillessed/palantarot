import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import { Scene } from "../sceneGraph/scene/Scene";
import { InfoNode } from "./info/InfoNode";
import { BoardNodeId, SceneNodeId } from "./NodeIds";

function initializeNodes() {
  const root = new TwoDNode(SceneNodeId);

  const boardNode = new TwoDNode(BoardNodeId);
  boardNode.update = () => {
    const width = root.container?.width ?? 0;
    const height = root.container?.height ?? 0;
    boardNode.offset = [width / 2, height / 2];
    boardNode.scale = [width / 2, height / 2];
  };
  root.addChild(boardNode);

  const infoNode = new InfoNode();
  root.addChild(infoNode);

  return root;
}

export function initializePlayScene(
  element: HTMLCanvasElement,
) {
  const scene = new Scene(element);
  const rootNode = initializeNodes();
  scene.setRoot(rootNode);
  return scene;
}
