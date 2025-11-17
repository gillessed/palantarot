import { useCallback, useMemo } from "react";
import type { PlayerId } from "../../server/play/model/GameState";
import type { ClientSocket } from "../services/socket/ClientSocket";
import type { Action } from "../../server/play/model/GameEvents";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";

export interface PlayEventHandler {
  joinGame: () => void;
  leaveGame: () => void;
  markReady: () => void;
  markUnready: () => void;
}

export function usePlayEventHandler(
  playerId: PlayerId,
  roomId: string,
  socket: ClientSocket
): PlayEventHandler {
  const sendActionMessage = useCallback(
    (action: Action) =>
      socket.send(
        RoomSocketMessages.gameAction({
          playerId: playerId,
          roomId,
          action,
        })
      ),
    [socket, playerId, roomId]
  );

  return useMemo(() => {
    return {
      joinGame: () => {
        sendActionMessage({
          type: "enter_game",
          player: playerId,
          time: Date.now(),
        });
      },
      leaveGame: () => {
        sendActionMessage({
          type: "leave_game",
          player: playerId,
          time: Date.now(),
        });
      },
      markReady: () => {
        sendActionMessage({
          type: "mark_player_ready",
          player: playerId,
          time: Date.now(),
        });
      },
      markUnready: () => {
        sendActionMessage({
          type: "mark_player_unready",
          player: playerId,
          time: Date.now(),
        });
      },
    };
  }, [sendActionMessage]);
}
