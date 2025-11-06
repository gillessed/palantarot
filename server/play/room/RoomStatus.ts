import { type PlayerEvent } from "../model/GameEvents.ts";
import { type GameSettings } from "../model/GameSettings.ts";
import { type ChatText } from "./ChatText.ts";
import { type PlayerStatus } from "./PlayerStatus.ts";

export interface RoomStatus {
  id: string;
  color: string;
  name: string;
  players: { [key: string]: PlayerStatus };
  settings: GameSettings;
  gameId: string;
  gameEvents: PlayerEvent[];
  chat: ChatText[];
}
