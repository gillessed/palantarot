import { useMemo } from "react";
import { Scene } from "../sceneGraph/scene/Scene";
import { PrimaryColor } from "./constants/Themes";
import type { PlaySceneContext } from "./PlaySceneContext";
import { RootNode } from "./RootNode";
import { useDebugConsole } from "./useDebugConsole";

export function usePlayScene(context: PlaySceneContext) {
  const scene = useMemo(() => {
    const scene = new Scene();
    scene.clearColor = PrimaryColor[8];
    const rootNode = new RootNode(context);
    scene.setRoot(rootNode);
    return scene;
  }, [context]);

  useDebugConsole(scene, context);
  return scene;
}
