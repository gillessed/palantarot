import { TypedAction } from 'redoodle';
import { GamePlayer } from './GamePlayerTypes';

const set = TypedAction.define("GAME PLAYER // SET")<GamePlayer | null>();
export const GamePlayerActions = {
  set
};
