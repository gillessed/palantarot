import { useMemo } from "react";
import type { PlayerId } from "../../server/play/model/GameState";
import type { ClientSocket } from "../services/socket/ClientSocket";
import { usePlayEventHandler, type PlayEventHandler } from "./PlayEventHandler";
import type { Player } from "../../server/model/Player";

export interface PlaySceneContext {
  readonly eventHandler: PlayEventHandler;
  readonly playerId: PlayerId;
  readonly roomId: string;
  readonly socket: ClientSocket;
  readonly players: Map<PlayerId, Player>;
}

export function usePlaySceneContext(
  playerId: PlayerId,
  roomId: string,
  players: Map<PlayerId, Player>,
  socket: ClientSocket
): PlaySceneContext {
  const eventHandler = usePlayEventHandler(playerId, roomId, socket);
  return useMemo(() => {
    return {
      eventHandler,
      playerId,
      roomId,
      players,
      socket,
    };
  }, [eventHandler, playerId, roomId, socket]);
}
