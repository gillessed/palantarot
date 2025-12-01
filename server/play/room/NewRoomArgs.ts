import { type GameSettings } from "../model/GameSettings.ts";

export interface NewRoomArgs {
  name: string;
  gameSettings: GameSettings;
}
