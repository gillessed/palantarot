import { useMemo } from "react";
import { Card } from "../../server/play/model/Card";
import type { Action } from "../../server/play/model/GameEvents";
import type {
  BidValue,
  Call,
  PlayerId,
} from "../../server/play/model/GameState";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";
import type { ClientSocket } from "../services/socket/ClientSocket";

export interface PlayEventHandler {
  joinGame: () => void;
  leaveGame: () => void;
  markReady: () => void;
  markUnready: () => void;
  bid: (value: BidValue, calls: Call[]) => void;
  callPartner: (card: Card) => void;
}

export function createPlayEventHandler(
  playerId: PlayerId,
  roomId: string,
  socket: ClientSocket
): PlayEventHandler {
  const sendActionMessage = (action: Action) => {
    socket.send(
      RoomSocketMessages.gameAction({
        roomId,
        action,
      })
    );
  };

  return {
    joinGame: () => {
      sendActionMessage({ playerId, time: Date.now(), type: "enter_game" });
    },
    leaveGame: () => {
      sendActionMessage({ playerId, time: Date.now(), type: "leave_game" });
    },
    markReady: () => {
      sendActionMessage({
        playerId,
        time: Date.now(),
        type: "mark_player_ready",
      });
    },
    markUnready: () => {
      sendActionMessage({
        playerId,
        time: Date.now(),
        type: "mark_player_unready",
      });
    },
    bid: (value: BidValue, calls: Call[]) => {
      sendActionMessage({
        playerId,
        time: Date.now(),
        type: "bid",
        bid: value,
        calls,
      });
    },
    callPartner: (card: Card) => {
      sendActionMessage({
        playerId,
        time: Date.now(),
        type: "call_partner",
        card,
      })
    }
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
