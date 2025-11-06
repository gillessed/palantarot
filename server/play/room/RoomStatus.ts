import { type PlayerEvent } from "../model/GameEvents";
import { type GameSettings } from "../model/GameSettings";
import { type ChatText } from "./ChatText";
import { PlayerStatus } from "./PlayerStatus";

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
