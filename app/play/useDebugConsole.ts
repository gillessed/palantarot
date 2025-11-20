import { useEffect } from "react";
import type { Scene } from "../sceneGraph/scene/Scene";
import { getPlayerDebugName } from "../services/utils/playerName";
import { filterFalsy } from "../utils/filterFalsy";
import {
  createPlayEventHandler,
  type PlayEventHandler,
} from "./PlayEventHandler";
import type { PlaySceneContext } from "./PlaySceneContext";
import { TableNodeId } from "./NodeIds";
import type { TableNode } from "./TableNode";

const DebugPlayerIds = ["1", "2", "3", "4", "5"];

interface DebugObject {
  scene: Scene;
  context: PlaySceneContext;
  players: Record<string, PlayEventHandler>;
  group: Record<string, any>;
  printGameState: () => void;
}

declare global {
  interface Window {
    d?: DebugObject;
  }
}

function createDebugObject(
  scene: Scene,
  context: PlaySceneContext
): DebugObject {
  const playHandlers: DebugObject["players"] = {};

  const debugPlayers = filterFalsy(
    DebugPlayerIds.map((id) => getPlayerDebugName(context.players.get(id)))
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

  const printGameState = () => {
    const tableNode = scene.getNode<TableNode>(TableNodeId);
    if (tableNode == null) {
      console.log("Table node not mounted yet");
    } else {
      console.log(tableNode.gameState);
    }
  };

  const debugObject: DebugObject = {
    scene,
    context,
    players: playHandlers,
    group,
    printGameState,
  };
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
