import { GameSettings } from '../model/GameSettings';

export interface NewRoomArgs {
  color: string;
  name: string;
  gameSettings: GameSettings;
}
