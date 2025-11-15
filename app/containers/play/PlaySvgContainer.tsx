import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Player } from "../../../server/model/Player";
import { initializePlayScene } from "../../play/initializePlayScene";
import "./PlaySvgContainer.scss";
import { Scene } from "../../sceneGraph/scene/Scene";

interface Props {
  players: Map<string, Player>;
}

export const PlaySvgContainer = memo(function PlaySvgContainer({}: Props) {
  const sceneRef = useRef<Scene | undefined>(undefined);
  const containerDiv = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const handleWindowResize = useCallback(() => {
    if (containerDiv.current != null) {
      setWidth(containerDiv.current.clientWidth);
      setHeight(containerDiv.current.clientHeight);
    }
  }, [containerDiv, setWidth, setHeight]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const setContainerRef = useCallback((ref: HTMLDivElement) => {
    if (ref != null && containerDiv.current == null) {
      containerDiv.current = ref;
      if (sceneRef.current != null) {
        sceneRef.current.width = width;
        sceneRef.current.height = height;
      }
      setWidth(containerDiv.current.clientWidth);
      setHeight(containerDiv.current.clientHeight);
    }
  }, []);

  const setCanvasRef = useCallback((ref: HTMLCanvasElement) => {
    if (sceneRef.current == null && ref != null) {
      const scene = initializePlayScene(ref);
      scene.width = width;
      scene.height = height;
      scene.run();
    }
  }, [width, height]);

  return (
    <div ref={setContainerRef} style={{ width: "100vw", height: "100vh" }}>
      {width > 0 && height > 0 && (
        <canvas ref={setCanvasRef} width={width} height={height} />
      )}
    </div>
  );
});
