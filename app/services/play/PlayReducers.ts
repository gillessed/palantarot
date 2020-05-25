import { TypedReducer } from 'redoodle';
import { BoardStateName } from '../../play/state';
import { PlayActions } from './PlayActions';
import { PlayState } from './PlayState';

const choosePlayerReducer = (_: PlayState | null, playerId: string) => {
  return {
    selfId: playerId,
    stateName: BoardStateName.NewGame,
    players: [playerId],
    bids: {},
    ready: {},
  };
}

export const playReducer = TypedReducer.builder<PlayState | null>()
  .withHandler(PlayActions.choosePlayer.TYPE, choosePlayerReducer)
  .withDefaultHandler((state = null) => state)
  .build();
