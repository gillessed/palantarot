import { createContext, useContext } from "react";
import type { PlayerId } from "../../server/play/model/GameState";

export interface GamePlayerContextType {
  gamePlayer: PlayerId | undefined;
  openGamePlayerDialog: () => void;
}
export const GamePlayerContext = createContext<GamePlayerContextType>({
  gamePlayer: undefined,
  openGamePlayerDialog: () => {},
});

export const useGamePlayer = () => {
  return useContext(GamePlayerContext).gamePlayer;
};
export const useOpenGamePlayerDialog = () => {
  return useContext(GamePlayerContext).openGamePlayerDialog;
};
