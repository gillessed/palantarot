import { GameErrors } from "../GameErrors.ts";
import {
  type BoardReducer,
  type CompletedBoardState,
  type CompletedStateActions,
  GameplayState,
  type ReducerResult,
} from "../GameState";
import { BiddingGameStateReducer } from "./BiddingGameStateReducer.ts";
import { DogRevealGameStateReducer } from "./DogRevealGameStateReducer.ts";
import { NewGameStateReducer } from "./NewGameStateReducer.ts";
import { PartnerCallGameStateReducer } from "./PartnerCallGameStateReducer.ts";
import { PlayingGameStateReducer } from "./PlayingGameStateReducer.ts";

export type GameReducerMap = { [state: string]: BoardReducer<any, any, any> };

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
