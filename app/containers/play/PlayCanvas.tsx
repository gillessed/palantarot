import { useResizeObserver } from "@mantine/hooks";
import { memo, useCallback, useEffect } from "react";
import { Player } from "../../../server/model/Player";
import { Scene } from "../../sceneGraph/scene/Scene";
import type { PlaySceneContext } from "../../play/PlaySceneContext";

interface Props {
  players: Map<string, Player>;
  scene: Scene<PlaySceneContext>;
}

export const PlayCanvas = memo(function PlaySvgContainer({ scene }: Props) {
  const [setResizeRef, divRect] = useResizeObserver();

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas != null) {
      scene.attachCanvas(canvas);
      scene.run();
    }
  }, []);

  useEffect(
    () => () => {
      scene.detachCanvas();
    },
    []
  );

  return (
    <div
      ref={setResizeRef}
      style={{ width: "100vw", height: "100vh", overflow: "none" }}
    >
      <canvas
        ref={setCanvasRef}
        width={divRect.width}
        height={divRect.height}
      />
    </div>
  );
});
