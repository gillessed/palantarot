import { useEffect } from "react";
import type { Scene } from "../sceneGraph/scene/Scene";
import { getPlayerDebugName } from "../services/utils/playerName";
import {
  createPlayEventHandler,
  type PlayEventHandler,
} from "./PlayEventHandler";
import type { PlaySceneContext } from "./PlaySceneContext";
import { filterFalsy } from "../utils/filterFalsy";

const DebugPlayerIds = ["1", "2", "3", "4", "5"];

interface DebugObject {
  scene: Scene;
  players: Record<string, PlayEventHandler>;
  group: Record<string, any>;
}

declare global {
  interface Window {
    d?: DebugObject;
  }
}

function createDebugObject(scene: Scene, context: PlaySceneContext): DebugObject {
  const playHandlers: DebugObject["players"] = {};

  const debugPlayers = filterFalsy(
    DebugPlayerIds.map((id) =>
      getPlayerDebugName(context.players.get(id))
    )
  );
  if (debugPlayers.length < 5) {
    console.warn(
      "Debug players not set up correctly. Do you have at least five players in the db?"
    );
  }

  for (const [playerId, player] of context.players.entries()) {
    const name = getPlayerDebugName(player);
    if (name == null) {
      continue;
    }

    const handler = createPlayEventHandler(
      playerId,
      context.roomId,
      context.socket
    );
    playHandlers[name] = handler;
  }

  const group = {
    joinGame: (playerCount: number) => {
      for (let i = 0; i < playerCount; i++) {
        const playerHandler = playHandlers[debugPlayers[i]];
        console.log(playerHandler);
        playerHandler.joinGame();
      }
    },
    leaveGame: (playerCount: number) => {
      for (let i = 0; i < playerCount; i++) {
        const playerHandler = playHandlers[debugPlayers[i]];
        playerHandler.leaveGame();
      }
    },
    markReady: (playerCount: number) => {
      for (let i = 0; i < playerCount; i++) {
        const playerHandler = playHandlers[debugPlayers[i]];
        playerHandler.markReady();
      }
    },
  };

  const debugObject: DebugObject = { scene, players: playHandlers, group };
  return debugObject;
}

export function useDebugConsole(scene: Scene, context: PlaySceneContext) {
  useEffect(() => {
    window.d = createDebugObject(scene, context);
    return () => {
      window.d = undefined;
    };
  }, [scene, context]);
}
