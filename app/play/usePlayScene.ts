import { useEffect, useMemo } from "react";
import { Scene } from "../sceneGraph/scene/Scene";
import { RootNode } from "./RootNode";
import type { PlaySceneContext } from "./PlaySceneContext";
import { useDebugConsole } from "./useDebugConsole";

export function usePlayScene(context: PlaySceneContext) {
  const scene = useMemo(() => {
    const scene = new Scene<PlaySceneContext>(context);
    const rootNode = new RootNode();
    scene.setRoot(rootNode);
    return scene;
  }, [context]);
  useDebugConsole(scene);
  return scene;
}
