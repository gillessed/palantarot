import { TypedReducer } from 'redoodle';
import { GamePlayerActions } from './GamePlayerActions';
import { GamePlayer } from './GamePlayerTypes';

const setGamePlayerReducer = (_: GamePlayer | null, gamePlayer: GamePlayer | null) => {
  return gamePlayer;
}

export const gamePlayerReducer = TypedReducer.builder<GamePlayer | null>()
.withDefaultHandler((state = null) => state)
.withHandler(GamePlayerActions.set.TYPE, setGamePlayerReducer)
.build();
