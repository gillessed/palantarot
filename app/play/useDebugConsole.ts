import { useEffect } from "react";
import { BidValue, Call } from "../../server/play/model/GameState";
import type { Scene } from "../sceneGraph/scene/Scene";
import { getPlayerDebugName } from "../services/utils/playerName";
import { filterFalsy } from "../utils/filterFalsy";
import { TableNodeId } from "./NodeIds";
import {
  createPlayEventHandler,
  type PlayEventHandler,
} from "./PlayEventHandler";
import type { PlaySceneContext } from "./PlaySceneContext";
import type { TableNode } from "./TableNode";

const DebugPlayerIds = ["1", "2", "3", "4", "5"];

interface DebugObject {
  scene: Scene;
  context: PlaySceneContext;
  players: Record<string, PlayEventHandler>;
  active: PlayEventHandler;
  group: Record<string, any>;
  startGame: (count: number) => void;
  getGameState: () => void;
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

  const getGameState = () => {
    const tableNode = scene.getNode<TableNode>(TableNodeId);
    if (tableNode == null) {
      throw Error("Table node not mounted yet");
    } else {
      return tableNode.gameState;
    }
  }

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

  const selfPlayerHandler =
    playHandlers[
      getPlayerDebugName(context.players.get(context.playerId)) ?? ""
    ];
  const active: PlayEventHandler = {
    joinGame: selfPlayerHandler.joinGame,
    leaveGame: selfPlayerHandler.leaveGame,
    markReady: selfPlayerHandler.markReady,
    markUnready: selfPlayerHandler.markUnready,
    bid: (value: BidValue, calls: Call[]) => {
      const toBid = getGameState().toBid;
      if (toBid == null) {
        throw Error("to bid is null");
      }
      const name = getPlayerDebugName(context.players.get(getGameState().playerOrder[toBid]));
      if (name == null) {
        throw Error("could not find active player");
      }
      playHandlers[name].bid(value, calls);
    },
  };

  const startGame = (count: number) => {
    group.joinGame(count);
    group.markReady(count);
  };

  const debugObject: DebugObject = {
    scene,
    context,
    players: playHandlers,
    group,
    active,
    startGame,
    getGameState: () => console.log(getGameState()),
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
