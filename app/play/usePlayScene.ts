import { useEffect, useMemo } from "react";
import { Scene } from "../sceneGraph/scene/Scene";
import { RootNode } from "./RootNode";
import type { PlaySceneContext } from "./PlaySceneContext";

export function usePlayScene(eventHandler: PlaySceneContext) {
  const scene = useMemo(() => {
    const scene = new Scene<PlaySceneContext>(eventHandler);
    const rootNode = new RootNode();
    scene.setRoot(rootNode);
    return scene;
  }, [eventHandler]);

  useEffect(() => {
    (window as any).getScene = () => scene;
    return () => {
      delete (window as any).getScene;
    };
  }, [scene]);
  return scene;
}
