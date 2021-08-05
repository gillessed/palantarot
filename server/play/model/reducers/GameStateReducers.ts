import {GameErrors} from '../GameErrors';
import {
  BoardReducer,
  CompletedBoardState,
  CompletedStateActions,
  GameplayState,
  ReducerResult,
} from '../GameState';
import {BiddingGameStateReducer} from './BiddingGameStateReducer';
import {DogRevealGameStateReducer} from './DogRevealGameStateReducer';
import {NewGameStateReducer} from './NewGameStateReducer';
import {PartnerCallGameStateReducer} from './PartnerCallGameStateReducer';
import {PlayingGameStateReducer} from './PlayingGameStateReducer';

export type GameReducerMap = {[state: string]: BoardReducer<any, any, any>};

export function buildGameStateReducer(): GameReducerMap {
  return {
    [GameplayState.NewGame]: NewGameStateReducer,
    [GameplayState.Bidding]: BiddingGameStateReducer,
    [GameplayState.PartnerCall]: PartnerCallGameStateReducer,
    [GameplayState.DogReveal]: DogRevealGameStateReducer,
    [GameplayState.Playing]: PlayingGameStateReducer,
    [GameplayState.Completed]: CompletedGameStateReducer,
  };
}

export const CompletedGameStateReducer = (
  state: CompletedBoardState,
  action: CompletedStateActions
): ReducerResult<CompletedBoardState> => {
  throw GameErrors.invalidActionForGameState(action, state.name);
};
