import { createContext, useContext } from "react";
import type { PlayerId } from "../../server/play/model/GameState";

export interface GamePlayerIdContextType {
  gamePlayerId: PlayerId | undefined;
  openGamePlayerDialog: () => void;
}
export const GamePlayerIdContext = createContext<GamePlayerIdContextType>({
  gamePlayerId: undefined,
  openGamePlayerDialog: () => {},
});

export const useGamePlayerId = () => {
  return useContext(GamePlayerIdContext).gamePlayerId;
};
export const useOpenGamePlayerDialog = () => {
  return useContext(GamePlayerIdContext).openGamePlayerDialog;
};
