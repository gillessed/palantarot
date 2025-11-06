import { GameErrors } from "../GameErrors.ts";
import {
  type BoardReducer,
  type CompletedBoardState,
  type CompletedStateActions,
  type ReducerResult,
} from "../GameState.ts";
import { BiddingGameStateReducer } from "./BiddingGameStateReducer.ts";
import { DogRevealGameStateReducer } from "./DogRevealGameStateReducer.ts";
import { NewGameStateReducer } from "./NewGameStateReducer.ts";
import { PartnerCallGameStateReducer } from "./PartnerCallGameStateReducer.ts";
import { PlayingGameStateReducer } from "./PlayingGameStateReducer.ts";

export type GameReducerMap = { [state: string]: BoardReducer<any, any, any> };

export function buildGameStateReducer(): GameReducerMap {
  return {
    ["new_game"]: NewGameStateReducer,
    ["bidding"]: BiddingGameStateReducer,
    ["partner_call"]: PartnerCallGameStateReducer,
    ["dog_reveal"]: DogRevealGameStateReducer,
    ["playing"]: PlayingGameStateReducer,
    ["completed"]: CompletedGameStateReducer,
  };
}

export const CompletedGameStateReducer = (
  state: CompletedBoardState,
  action: CompletedStateActions
): ReducerResult<CompletedBoardState> => {
  throw GameErrors.invalidActionForGameState(action, state.name);
};
