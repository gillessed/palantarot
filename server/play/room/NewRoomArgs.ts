import { type GameSettings } from "../model/GameSettings.ts";

export interface NewRoomArgs {
  color: string;
  name: string;
  gameSettings: GameSettings;
}
