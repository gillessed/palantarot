import { useMemo } from "react";
import type { Action } from "../../server/play/model/GameEvents";
import type { PlayerId } from "../../server/play/model/GameState";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";
import type { ClientSocket } from "../services/socket/ClientSocket";

export interface PlayEventHandler {
  joinGame: () => void;
  leaveGame: () => void;
  markReady: () => void;
  markUnready: () => void;
}

export function createPlayEventHandler(
  playerId: PlayerId,
  roomId: string,
  socket: ClientSocket
): PlayEventHandler {
  const sendActionMessage = (
    actionPayload: Omit<Action, "playerId" | "time">
  ) => {
    const action = {
      ...actionPayload,
      playerId,
      time: Date.now(),
    } as Action;
    socket.send(
      RoomSocketMessages.gameAction({
        roomId,
        action,
      })
    );
  };

  return {
    joinGame: () => {
      sendActionMessage({ type: "enter_game" });
    },
    leaveGame: () => {
      sendActionMessage({ type: "leave_game" });
    },
    markReady: () => {
      sendActionMessage({ type: "mark_player_ready" });
    },
    markUnready: () => {
      sendActionMessage({ type: "mark_player_unready" });
    },
  };
}

export function usePlayEventHandler(
  playerId: PlayerId,
  roomId: string,
  socket: ClientSocket
): PlayEventHandler {
  return useMemo(
    () => createPlayEventHandler(playerId, roomId, socket),
    [playerId, roomId, socket]
  );
}
